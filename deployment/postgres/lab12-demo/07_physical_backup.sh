#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

STAMP="${1:-$(date +%Y%m%d_%H%M%S)}"
BACKUP_DIR="${PHYSICAL_BACKUP_ROOT}/base16_${STAMP}"

echo "== Creating physical backup in: ${BACKUP_DIR} =="
mkdir -p "$BACKUP_DIR"

PGPASSWORD="$REPL_PASSWORD" pg_basebackup \
  -h "$PGHOST" \
  -p "$PG_LOCAL_PORT" \
  -U "$REPL_USER" \
  --pgdata="$BACKUP_DIR" \
  --format=plain \
  --wal-method=stream \
  --checkpoint=fast \
  --label="lab12_physical_${STAMP}" \
  --progress \
  --verbose

du -sh "$BACKUP_DIR"
echo "== Physical backup completed =="
