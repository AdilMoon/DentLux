# Минимальный Terraform для РК (инфраструктура как код).
# Запуск из этой папки: terraform init && terraform apply
# Ресурс перезапускает compose при изменении docker-compose.yml (хеш файла).

terraform {
  required_version = ">= 1.0"

  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

variable "compose_project_dir" {
  type        = string
  description = "Каталог с docker-compose.yml (корень репозитория DentLux)"
  default     = "../.."
}

locals {
  compose_file = abspath("${path.module}/${var.compose_project_dir}/docker-compose.yml")
}

resource "null_resource" "docker_compose_up" {
  triggers = {
    compose_sha = filesha256(local.compose_file)
  }

  provisioner "local-exec" {
    working_dir = dirname(local.compose_file)
    command     = "docker compose up -d --build"
  }
}

output "compose_file" {
  value       = local.compose_file
  description = "Абсолютный путь к docker-compose.yml"
}
