#!/usr/bin/env bash
# Если в обычном терминале: «permission denied ... docker.sock» —
# эта обёртка запускает docker compose от имени группы docker (как sg docker).
#
# Использование (из корня репозитория):
#   ./deployment/docker-compose-sg.sh build jenkins --no-cache
#   ./deployment/docker-compose-sg.sh up -d jenkins

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

quote_args() {
  local s=""
  for a in "$@"; do
    s+=$(printf '%q ' "$a")
  done
  printf '%s' "$s"
}

exec sg docker -c "cd $(printf '%q' "$ROOT") && docker compose $(quote_args "$@")"
