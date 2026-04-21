#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

if [[ ! -f "$CUSTOM_BACKUP" ]]; then
  echo "Custom backup not found: $CUSTOM_BACKUP"
  exit 1
fi

echo "== Selective restore demo: truncate only grades table =="
psql -v ON_ERROR_STOP=1 -c "TRUNCATE TABLE grades CASCADE;"

echo "== Restoring only grades data from custom backup =="
pg_restore --verbose --data-only --table=grades --dbname="$PGDATABASE" "$CUSTOM_BACKUP"

echo "== Selective restore complete (grades only) =="
