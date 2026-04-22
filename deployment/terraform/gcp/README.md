# DentLux GCP Terraform (Enterprise Baseline)

Этот стек поднимает production-готовую базу в Google Cloud:
- отдельная VPC и subnet;
- firewall под SSH и web/APP порты;
- VM с фиксированным public IP;
- bootstrap (Docker, Compose, UFW, Fail2Ban, optional Ops Agent);
- автоматическая генерация `deployment/ansible/inventory.gcp.ini`.

## 1) Предварительные требования

- Terraform `>= 1.5`
- gcloud CLI
- права в проекте GCP на Compute/Networking/Service Usage

```bash
gcloud auth login
gcloud auth application-default login
```

## 2) Подготовка переменных

```bash
cd deployment/terraform/gcp
cp terraform.tfvars.example terraform.tfvars
```

Обязательно:
- `project_id` — ваш проект GCP
- `ssh_public_key` — ваш публичный ключ
- `allowed_ssh_cidrs` — ограничьте вашим IP (`x.x.x.x/32`)

## 3) Локальный или remote state

Локально:
```bash
make init
```

Remote state (рекомендуется):
```bash
cp backend.hcl.example backend.hcl
make init-remote
```

## 4) Развертывание

```bash
make fmt
make validate
make plan
make apply
```

## 5) Проверка

```bash
make output
```

После `apply` Terraform создаст `deployment/ansible/inventory.gcp.ini` с IP VM — можно сразу запускать enterprise Ansible playbook.

## Jenkins integration

В Jenkins используется job `dentlux-infra-cd` (`deployment/jenkins/Jenkinsfile.infra`):
- credential `gcp-sa-json` (Secret file) для `GOOGLE_APPLICATION_CREDENTIALS`;
- credential `dentlux-ssh-key` (SSH private key) для Ansible SSH-доступа;
- параметр `TF_ACTION` (`plan|apply|destroy`) и `RUN_ANSIBLE_DEPLOY`.
