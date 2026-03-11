#!/bin/bash

# Установка и настройка SSH
echo "Установка и настройка SSH..."
sudo apt update
sudo apt install -y openssh-server

# Настройка SSH порта и авторизации
if [ -f /etc/ssh/sshd_config ]; then
    # Настройка порта 2222 (замена любой существующей директивы Port или добавление новой)
    if grep -q "^Port" /etc/ssh/sshd_config; then
        sudo sed -i 's/^Port .*/Port 2222/' /etc/ssh/sshd_config
    elif grep -q "^#Port 22" /etc/ssh/sshd_config; then
        sudo sed -i 's/^#Port 22/Port 2222/' /etc/ssh/sshd_config
    else
        echo "Port 2222" | sudo tee -a /etc/ssh/sshd_config
    fi
    
    # Отключение входа по паролю
    sudo sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    if ! grep -q "^PasswordAuthentication no" /etc/ssh/sshd_config; then
        echo "PasswordAuthentication no" | sudo tee -a /etc/ssh/sshd_config
    fi
    
    # Создание директории для сокета (иногда требуется после установки)
    sudo mkdir -p /run/sshd
    sudo chmod 0755 /run/sshd
    
    # Проверка конфигурации и перезапуск
    if sudo sshd -t; then
        sudo systemctl restart ssh || sudo systemctl restart sshd
    else
        echo "Ошибка в конфигурации SSH. Проверьте /etc/ssh/sshd_config."
        exit 1
    fi
else
    echo "Ошибка: /etc/ssh/sshd_config не найден."
fi

# Настройка Firewall (UFW)
echo "Настройка Firewall (UFW)..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Установка и настройка Fail2Ban
echo "Установка и настройка Fail2Ban..."
sudo apt update
sudo apt install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo sed -i 's/port    = ssh/port    = 2222/' /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

echo "Сервер защищен. SSH теперь доступен по порту 2222."
