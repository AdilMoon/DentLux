#!/bin/bash

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
  echo "Использование: ./setup_ssl.sh example.com"
  exit 1
fi

echo "Установка Nginx (если не установлен)..."
sudo apt update
sudo apt install -y nginx

# Создаем необходимые директории на случай, если они отсутствуют
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

echo "Генерация самоподписанного сертификата для $DOMAIN..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=DentLux/OU=IT/CN=$DOMAIN"

echo "Настройка SSL в Nginx..."
sudo tee /etc/nginx/sites-available/dentlux <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Создаем символическую ссылку, если её еще нет
if [ ! -L /etc/nginx/sites-enabled/dentlux ]; then
    sudo ln -s /etc/nginx/sites-available/dentlux /etc/nginx/sites-enabled/
fi

# Проверка конфигурации и перезапуск
sudo nginx -t && sudo systemctl restart nginx
