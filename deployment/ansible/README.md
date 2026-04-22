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
cp inventory.gcp.example.ini inventory.gcp.ini
ansible -i inventory.gcp.ini dentlux -m ping
ansible-playbook -i inventory.gcp.ini site-enterprise.yml
```

## Интеграция с Terraform GCP

После `terraform apply` в `deployment/terraform/gcp` автоматически создается:
- `deployment/ansible/inventory.gcp.ini`

Далее можно сразу запускать:
```bash
cd deployment/ansible
ansible-galaxy collection install -r requirements.yml
ansible-playbook -i inventory.gcp.ini site-enterprise.yml
```

## Jenkins orchestration

Инфра job `dentlux-infra-cd` сначала выполняет Terraform, а затем этот playbook:
- Terraform генерирует `inventory.gcp.ini`;
- Jenkins передает SSH-ключ через credential `dentlux-ssh-key`;
- деплой выполняется автоматически при `TF_ACTION=apply` и `RUN_ANSIBLE_DEPLOY=true`.
