variable "aws_region" {
  description = "AWS region (e.g. eu-central-1)"
  type        = string
  default     = "eu-central-1"
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

variable "vpc_cidr" {
  description = "CIDR for VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR for public subnet"
  type        = string
  default     = "10.20.1.0/24"
}

variable "availability_zone" {
  description = "AZ for public subnet (null = first available in region)"
  type        = string
  default     = null
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "disk_size_gb" {
  description = "Root volume size in GB"
  type        = number
  default     = 50
}

variable "ssh_user" {
  description = "Linux user for SSH/Ansible (official Ubuntu AMI uses ubuntu)"
  type        = string
  default     = "ubuntu"
}

variable "ssh_public_key" {
  description = "Public SSH key (e.g. ssh-ed25519 AAAA...)"
  type        = string
  sensitive   = true
}

variable "allowed_ssh_cidrs" {
  description = <<-EOT
    Source IPv4 CIDRs allowed to reach the instance on TCP/22 (your laptop/public IP as /32), NOT the Elastic IP of the server.
    If Ansible or ssh says "Connection refused" or times out, compare this list with your current public IP (curl -4 ifconfig.me).
  EOT
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "aws_application_tag_value" {
  description = "Optional AWS myApplications tag value (awsApplication)"
  type        = string
  default     = ""
}
