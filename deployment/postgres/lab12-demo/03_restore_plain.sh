#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

if [[ ! -f "$PLAIN_BACKUP" ]]; then
  echo "Plain backup not found: $PLAIN_BACKUP"
  exit 1
fi

echo "== Restoring from plain SQL: $PLAIN_BACKUP =="
# full dump includes DROP/CREATE DATABASE university_db,
# so run from a different DB context to avoid dropping active DB
psql --dbname=postgres -v ON_ERROR_STOP=1 < "$PLAIN_BACKUP"

echo "== Restore complete (plain) =="
