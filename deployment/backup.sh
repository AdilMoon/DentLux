#!/bin/bash

# Настройки резервного копирования
BACKUP_DIR="/home/$USER/backups/dentlux"
RETENTION_DAYS=7
DB_CONTAINER="dentlux_db"
DB_NAME="dentreserve_pro"
DB_USER="postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Создаем директорию для бэкапов, если она не существует
mkdir -p "$BACKUP_DIR"

echo "Начало резервного копирования базы данных..."

# Выполняем дамп базы данных прямо из Docker-контейнера
# Используем docker exec для вызова pg_dump, затем сжимаем через gzip
if sudo docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    echo "Резервная копия успешно создана: $BACKUP_FILE"
    
    # Права на файл (только владелец)
    chmod 600 "$BACKUP_FILE"
    
    # Удаление старых бэкапов (старше RETENTION_DAYS дней)
    echo "Очистка старых бэкапов (старше $RETENTION_DAYS дней)..."
    find "$BACKUP_DIR" -type f -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    echo "Готово!"
else
    echo "Ошибка при создании резервной копии!"
    exit 1
fi
