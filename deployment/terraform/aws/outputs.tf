output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "instance_id" {
  description = "EC2 instance id"
  value       = aws_instance.dentlux.id
}

output "public_ip" {
  description = "Elastic IP for DentLux EC2"
  value       = aws_eip.dentlux.public_ip
}

output "ansible_inventory_file" {
  description = "Generated Ansible inventory path"
  value       = local_file.ansible_inventory.filename
}
