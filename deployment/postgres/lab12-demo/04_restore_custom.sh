#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

if [[ ! -f "$CUSTOM_BACKUP" ]]; then
  echo "Custom backup not found: $CUSTOM_BACKUP"
  exit 1
fi

echo "== Restoring from custom dump: $CUSTOM_BACKUP =="
pg_restore --verbose --clean --if-exists --dbname="$PGDATABASE" "$CUSTOM_BACKUP"

echo "== Restore complete (custom) =="
