#!/usr/bin/env bash
# Уведомление в Telegram из Jenkins (или вручную для проверки).
# Переменные: TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, TEXT (или аргумент — текст сообщения)

set -euo pipefail
TEXT="${TEXT:-${1:-}}"
if [[ -z "${TELEGRAM_TOKEN:-}" || -z "${TELEGRAM_CHAT_ID:-}" || -z "$TEXT" ]]; then
  echo "skip: TELEGRAM_TOKEN, TELEGRAM_CHAT_ID и текст сообщения обязательны" >&2
  exit 0
fi

RESP=$(curl -sS -m 25 -w '\n%{http_code}' -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "text=${TEXT}")
HTTP_CODE=$(echo "$RESP" | tail -n1)
BODY=$(echo "$RESP" | sed '$d')
if [[ "$HTTP_CODE" != "200" ]]; then
  echo "Telegram API HTTP $HTTP_CODE: $BODY" >&2
  exit 1
fi
echo "Telegram: сообщение отправлено (HTTP 200)"
