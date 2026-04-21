#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

echo "== Available physical backups =="
ls -ld ${PHYSICAL_BACKUP_ROOT}/base16_* 2>/dev/null || true
