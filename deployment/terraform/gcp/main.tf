locals {
  stack_name             = "${var.name_prefix}-${var.environment}"
  ansible_inventory_path = "${path.module}/../../ansible/inventory.gcp.ini"
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_project_service" "required" {
  for_each = toset([
    "compute.googleapis.com",
    "artifactregistry.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com"
  ])

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_compute_network" "dentlux" {
  name                    = "${local.stack_name}-vpc"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.required]
}

resource "google_compute_subnetwork" "dentlux" {
  name          = "${local.stack_name}-subnet"
  ip_cidr_range = var.network_cidr
  region        = var.region
  network       = google_compute_network.dentlux.id
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "${local.stack_name}-allow-ssh"
  network = google_compute_network.dentlux.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = var.allowed_ssh_cidrs
  target_tags   = ["${local.stack_name}-app"]
}

resource "google_compute_firewall" "allow_web" {
  name    = "${local.stack_name}-allow-web"
  network = google_compute_network.dentlux.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "4000", "8080", "8090"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["${local.stack_name}-app"]
}

resource "google_compute_address" "dentlux_public_ip" {
  name   = "${local.stack_name}-public-ip"
  region = var.region
}

resource "google_service_account" "vm" {
  account_id   = "${var.name_prefix}-${var.environment}-vm"
  display_name = "DentLux ${var.environment} VM service account"
}

resource "google_compute_instance" "dentlux" {
  name         = "${local.stack_name}-vm"
  machine_type = var.machine_type
  zone         = var.zone
  tags         = ["${local.stack_name}-app"]

  boot_disk {
    initialize_params {
      image = "projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts"
      size  = var.disk_size_gb
      type  = "pd-balanced"
    }
  }

  network_interface {
    network    = google_compute_network.dentlux.id
    subnetwork = google_compute_subnetwork.dentlux.id

    access_config {
      nat_ip = google_compute_address.dentlux_public_ip.address
    }
  }

  service_account {
    email  = google_service_account.vm.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${var.ssh_public_key}"
  }

  metadata_startup_script = <<-EOT
    #!/usr/bin/env bash
    set -euxo pipefail
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y ca-certificates curl gnupg git jq python3 python3-pip
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    . /etc/os-release
    echo "deb [arch=$$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $$VERSION_CODENAME stable" > /etc/apt/sources.list.d/docker.list
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin fail2ban ufw
    usermod -aG docker ${var.ssh_user} || true
    systemctl enable docker
    systemctl restart docker
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 4000/tcp
    ufw allow 8080/tcp
    ufw allow 8090/tcp
    ufw --force enable
    %{if var.enable_ops_agent~}
    curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
    bash add-google-cloud-ops-agent-repo.sh --also-install
    %{endif~}
  EOT

  depends_on = [
    google_project_service.required,
    google_compute_firewall.allow_ssh,
    google_compute_firewall.allow_web
  ]
}

resource "local_file" "ansible_inventory" {
  filename = local.ansible_inventory_path
  content  = <<-EOF
    [dentlux]
    ${google_compute_address.dentlux_public_ip.address} ansible_user=${var.ssh_user} ansible_port=22
  EOF
}
