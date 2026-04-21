#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

echo "== Verification after grades-only restore =="
psql -v ON_ERROR_STOP=1 -c "
SELECT 'students' AS t, COUNT(*) FROM students
UNION ALL
SELECT 'grades', COUNT(*) FROM grades
ORDER BY t;"
