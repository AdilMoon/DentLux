variable "project_id" {
  description = "Google Cloud project id"
  type        = string
}

variable "region" {
  description = "Primary GCP region"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "Primary GCP zone"
  type        = string
  default     = "europe-west1-b"
}

variable "environment" {
  description = "Environment name (dev/stage/prod)"
  type        = string
  default     = "prod"
}

variable "name_prefix" {
  description = "Prefix used for all resources"
  type        = string
  default     = "dentlux"
}

variable "machine_type" {
  description = "GCE machine type"
  type        = string
  default     = "e2-standard-2"
}

variable "disk_size_gb" {
  description = "Boot disk size in GB"
  type        = number
  default     = 50
}

variable "network_cidr" {
  description = "CIDR for DentLux subnet"
  type        = string
  default     = "10.20.0.0/24"
}

variable "ssh_user" {
  description = "Linux user used for SSH and Ansible"
  type        = string
  default     = "dentops"
}

variable "ssh_public_key" {
  description = "Public SSH key content (e.g. ssh-ed25519 AAAA...)"
  type        = string
  sensitive   = true
}

variable "allowed_ssh_cidrs" {
  description = "Allowed source CIDRs for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_ops_agent" {
  description = "Install Google Ops Agent from startup script"
  type        = bool
  default     = true
}
