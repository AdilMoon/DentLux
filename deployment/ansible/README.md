# DentLux Ansible (Enterprise)

Новый playbook `site-enterprise.yml` использует role-based подход:
- `common` — базовые пакеты и автообновления;
- `docker` — установка Docker Engine + Compose plugin;
- `security` — UFW + Fail2Ban;
- `deploy` — git checkout, `docker compose up -d --build`, health checks.

Старый `site.yml` оставлен как быстрый минимальный вариант.

## Быстрый старт

```bash
cd deployment/ansible
ansible-galaxy collection install -r requirements.yml
cp inventory.aws.example.ini inventory.aws.ini
ansible -i inventory.aws.ini dentlux -m ping
ansible-playbook -i inventory.aws.ini site-enterprise.yml
```

## Интеграция с Terraform AWS

После `terraform apply` в `deployment/terraform/aws` автоматически создаётся:

- `deployment/ansible/inventory.aws.ini`

Далее:

```bash
cd deployment/ansible
ansible-galaxy collection install -r requirements.yml
ansible-playbook -i inventory.aws.ini site-enterprise.yml
```

## Jenkins orchestration

Job `dentlux-infra-cd` выполняет Terraform AWS, затем этот playbook:

- Terraform генерирует `inventory.aws.ini`;
- Jenkins: `aws-terraform` (IAM access key) + `dentlux-ssh-key` (SSH);
- деплой при `TF_ACTION=apply` и `RUN_ANSIBLE_DEPLOY=true`.
