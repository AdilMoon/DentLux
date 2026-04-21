#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

echo "== Simulating accident: TRUNCATE grades + DELETE students(course=1) =="
psql -v ON_ERROR_STOP=1 -c "
TRUNCATE TABLE grades CASCADE;
DELETE FROM students WHERE course = 1;"

psql -v ON_ERROR_STOP=1 -c "
SELECT 'students_after_damage' AS t, COUNT(*) FROM students
UNION ALL
SELECT 'grades_after_damage', COUNT(*) FROM grades
ORDER BY t;"
