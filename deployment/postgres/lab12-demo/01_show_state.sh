#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

echo "== Current row counts =="
psql -v ON_ERROR_STOP=1 -c "
SELECT 'faculties' AS t, COUNT(*) FROM faculties
UNION ALL
SELECT 'specialties', COUNT(*) FROM specialties
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects
UNION ALL
SELECT 'grades', COUNT(*) FROM grades
ORDER BY t;"
