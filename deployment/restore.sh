#!/bin/bash

# Настройки восстановления
DB_CONTAINER="dentlux_db"
DB_NAME="dentreserve_pro"
DB_USER="postgres"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Использование: ./restore.sh /путь/к/файлу/бэкапа.sql.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Файл не найден: $BACKUP_FILE"
    exit 1
fi

echo "Начало восстановления базы данных из $BACKUP_FILE..."

# ВНИМАНИЕ: Восстановление перезапишет существующие данные!
# Сначала очищаем старую БД (или просто загружаем дамп, pg_dump обычно содержит DROP TABLE если указан --clean, но наш скрипт делал обычный дамп)
# Лучше всего сделать восстановление в чистую БД или использовать --clean в pg_dump. 
# В данном случае просто загружаем данные через psql.

if gunzip -c "$BACKUP_FILE" | sudo docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"; then
    echo "Восстановление успешно завершено!"
else
    echo "Ошибка при восстановлении базы данных!"
    exit 1
fi
