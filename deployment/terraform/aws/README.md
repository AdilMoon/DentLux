# DentLux AWS Terraform

Поднимает в AWS:

- VPC, публичная подсеть, Internet Gateway, маршрутизация
- Security Group: SSH (ограничение по `allowed_ssh_cidrs`) и порты 80, 443, 4000, 8080, 8090
- EC2 (Ubuntu 22.04), Elastic IP
- `aws_key_pair` из вашего публичного SSH-ключа
- User-data: Docker, Compose, UFW, Fail2Ban
- Генерация `deployment/ansible/inventory.aws.ini`

## Требования

- Аккаунт AWS, включённый биллинг
- IAM пользователь с правами на EC2/VPC/EIP (для демо часто `AdministratorAccess` на отдельном аккаунте; в проде — минимальные политики)
- Terraform `>= 1.5`

Локально задайте креды (один из вариантов):

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=eu-central-1
```

## Настройка

```bash
cd deployment/terraform/aws
cp terraform.tfvars.example terraform.tfvars
```

Заполните `ssh_public_key`, `allowed_ssh_cidrs` (ваш IP `/32`). Для официального AMI Ubuntu пользователь по умолчанию — **`ubuntu`** (`ssh_user`).

Если хотите видеть ресурсы в AWS **myApplications**, укажите `aws_application_tag_value` (значение тега `awsApplication` из вашего приложения).

## Команды

```bash
make init
make fmt
make validate
make plan
make apply
make output
```

## Jenkins

В job `dentlux-infra-cd` используется credential **`aws-terraform`** (тип **Username with password**):

- **Username** = AWS Access Key ID
- **Password** = AWS Secret Access Key

Параметр **AWS_REGION** в job должен совпадать с `aws_region` в `terraform.tfvars`.

После `apply` появится `deployment/ansible/inventory.aws.ini` — дальше Ansible `site-enterprise.yml`.
