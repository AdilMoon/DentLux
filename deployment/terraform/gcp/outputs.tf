output "project_id" {
  description = "GCP project id used by this stack"
  value       = var.project_id
}

output "vm_name" {
  description = "DentLux VM instance name"
  value       = google_compute_instance.dentlux.name
}

output "public_ip" {
  description = "Public static IP for DentLux VM"
  value       = google_compute_address.dentlux_public_ip.address
}

output "ansible_inventory_file" {
  description = "Generated Ansible inventory path"
  value       = local_file.ansible_inventory.filename
}
