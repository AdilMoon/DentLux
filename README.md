# Dental Master

## Быстрый запуск

1. Backend:

```powershell
cd backend
npm install
```

Создайте `backend/.env`:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:12345@localhost:5432/dentreserve_pro?schema=public"
JWT_SECRET=change_me_to_very_long_random_secret_at_least_32_chars
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4000
```

2. Frontend:

```powershell
cd frontend
npm install
```

Создайте `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_JWT_STORAGE_KEY=dentreserve_token
```

3. Запуск:

```powershell
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000`  
Health: `http://localhost:4000/health`

## Запуск через Docker (Рекомендуется)

Для запуска всего проекта одной командой (включая БД и Portainer):

1.  Убедитесь, что у вас установлен Docker и Docker Compose.
2.  Выполните команду в корне проекта:
    ```bash
    docker-compose up -d --build
    ```
3.  Сервисы будут доступны по адресам:
    - **Frontend:** `http://localhost` (порт 80)
    - **Backend:** `http://localhost:4000`
    - **Portainer:** `http://localhost:9000` (управление контейнерами)
    - **Grafana:** `http://localhost:3000` (мониторинг, логин: `admin`/`admin`)
    - **Prometheus:** `http://localhost:9090` (метрики)

При первом запуске Portainer предложит создать пароль администратора. Выберите "Get Started" и вы увидите локальное окружение Docker.

В Grafana при первом входе используйте `admin/admin`. Для начала работы добавьте Prometheus как источник данных (URL: `http://prometheus:9090`).

## Настройка сервера и безопасность (Deployment)

В папке `deployment/` находятся скрипты и конфигурации для защиты сервера:

1. **Базовая защита (SSH, Firewall, Fail2Ban):**
   ```bash
   chmod +x deployment/setup_security.sh
   sudo ./deployment/setup_security.sh
   ```
   *Что делает:* Меняет порт SSH на 2222, отключает вход по паролю (нужен SSH-ключ), настраивает UFW (порты 80, 443, 2222) и устанавливает Fail2Ban.

2. **Настройка Nginx и SSL:**
   - Пример конфигурации обратного прокси: `deployment/nginx/dentlux.conf`.
   - Скрипт для настройки SSL (самоподписанный):
     ```bash
     chmod +x deployment/nginx/setup_ssl.sh
     sudo ./deployment/nginx/setup_ssl.sh your-domain.com
     ```

3. **Резервное копирование (Backup):**
   - Скрипт для создания бэкапа базы данных:
     ```bash
     chmod +x deployment/backup.sh
     ./deployment/backup.sh
     ```
     *Бэкапы сохраняются в `~/backups/dentlux/`.*
   - Настройка ежедневного бэкапа в 3 часа ночи (через cron):
     ```bash
     (crontab -l 2>/dev/null; echo "0 3 * * * /home/$USER/Downloads/DentLux-main/deployment/backup.sh") | crontab -
     ```

### Остановка проекта
```bash
docker-compose down
```
