# Используем базовый образ Node.js (Debian-based для Prisma)
FROM node:18-bullseye-slim

# Prisma + сборка bcrypt из исходников (если не скачался prebuilt с GitHub)
RUN apt-get update && apt-get install -y \
    openssl libssl-dev ca-certificates \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
# Копируем prisma схему ПЕРЕД npm install, так как postinstall запускает prisma generate
COPY prisma ./prisma/

RUN npm install

# Копируем остальные файлы приложения
COPY . .

# Открываем порт
EXPOSE 4000

# Команда для запуска (используем скрипт для ожидания БД и запуска миграций)
CMD ["npm", "run", "dev"]
