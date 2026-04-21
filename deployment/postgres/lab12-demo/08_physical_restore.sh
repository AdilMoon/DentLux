#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

BACKUP_DIR="${1:-$(ls -dt ${PHYSICAL_BACKUP_ROOT}/base16_* 2>/dev/null | head -n 1)}"
if [[ -z "${BACKUP_DIR:-}" || ! -d "$BACKUP_DIR" ]]; then
  echo "Physical backup directory not found. Pass it explicitly:"
  echo "  ./08_physical_restore.sh /backup/physical/base16_YYYYMMDD_HHMMSS"
  exit 1
fi

echo "This will STOP ${PG_CLUSTER_SERVICE} and replace ${PGDATA_DIR} from:"
echo "  ${BACKUP_DIR}"
read -r -p "Type YES to continue: " CONFIRM
if [[ "$CONFIRM" != "YES" ]]; then
  echo "Cancelled."
  exit 1
fi

if [[ -z "${SUDO_PASS:-}" ]]; then
  read -r -s -p "Enter sudo password: " SUDO_PASS
  echo
fi

TS="$(date +%Y%m%d_%H%M%S)"
OLD_DIR="${PGDATA_DIR}_before_restore_${TS}"

echo "== Stopping cluster =="
echo "$SUDO_PASS" | sudo -S systemctl stop "$PG_CLUSTER_SERVICE"

echo "== Replacing PGDATA (backup old dir to ${OLD_DIR}) =="
echo "$SUDO_PASS" | sudo -S mv "$PGDATA_DIR" "$OLD_DIR"
echo "$SUDO_PASS" | sudo -S mkdir -p "$PGDATA_DIR"
echo "$SUDO_PASS" | sudo -S cp -a "${BACKUP_DIR}/." "$PGDATA_DIR/"
echo "$SUDO_PASS" | sudo -S chown -R postgres:postgres "$PGDATA_DIR"
echo "$SUDO_PASS" | sudo -S chmod 700 "$PGDATA_DIR"

echo "== Starting cluster =="
echo "$SUDO_PASS" | sudo -S systemctl start "$PG_CLUSTER_SERVICE"

echo "== Quick check =="
echo "$SUDO_PASS" | sudo -S -u postgres psql -p "$PG_LOCAL_PORT" -d postgres -c "SELECT version(), now();"
echo "Restore finished. Old data dir kept at: ${OLD_DIR}"
