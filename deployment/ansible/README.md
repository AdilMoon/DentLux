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

По умолчанию в Jenkins используется `terraform.tfvars.example` (файл есть в репозитории). Свой `terraform.tfvars` не коммитьте: передайте путь через параметр `TF_VARS_FILE` или положите файл в workspace (Secret File).

## Если Ansible: `UNREACHABLE` / `Connection refused` на порту 22

1. **Проверьте, что EC2 запущена** в консоли AWS (`EC2 → Instances → Running`).
2. **IP мог смениться** — обновите инвентарь из Terraform (из каталога `deployment/terraform/aws`, где есть `terraform.tfstate`):

```bash
cd deployment/terraform/aws
terraform output -raw public_ip
```

Скопируйте IP в `deployment/ansible/inventory.aws.ini` в строку `[dentlux]`, либо снова выполните `terraform apply`, чтобы `local_file` перезаписал `inventory.aws.ini`.

3. **Security Group (`allowed_ssh_cidrs`) — частая ошибка**  
   В `inventory.aws.ini` указан **IP сервера** (Elastic IP). Это не то же самое, что **IP вашего ПК**, с которого идёт Ansible/SSH.  
   В Terraform переменная `allowed_ssh_cidrs` задаёт **кто может подключаться к порту 22** (обычно ваш домашний/офисный IP в виде `a.b.c.d/32`).  
   Узнать свой текущий публичный IP:
   ```bash
   curl -4 -sS https://ifconfig.me ; echo
   ```
   Добавьте этот адрес в `allowed_ssh_cidrs` в `deployment/terraform/aws/terraform.tfvars`, затем:
   ```bash
   cd deployment/terraform/aws
   terraform apply -var-file=terraform.tfvars -auto-approve
   ```
   После смены правила в SG подождите несколько секунд и снова `ansible-playbook ...`.  
   (Если в `terraform.tfvars` оставить чужой или старый `/32`, AWS может отбрасывать трафик — часто это **timeout**, реже ведёт себя как **refused** в зависимости от сети.)

4. Проверка с машины, где запускаете Ansible:

```bash
ssh -i ~/.ssh/your_key ubuntu@<PUBLIC_IP> -p 22
```
