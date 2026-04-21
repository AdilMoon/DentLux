# Lab 12 Report (pgAdmin/Ubuntu, PostgreSQL Backup & Restore)

Date: 2026-04-13  
Host: Ubuntu  
PostgreSQL: 16 (`postgresql@16-main`)  
Cluster port used: `55432` (because `5432` and `5433` were occupied by Docker proxy)

## Environment Notes

- Local PostgreSQL 16 cluster was configured and started on port `55432`.
- Docker occupied default PostgreSQL ports, so tasks were completed on local system cluster at `localhost:55432`.
- Mandatory tasks from the provided methodology were completed via CLI (equivalent DB operations for pgAdmin lab flow).

## Mandatory Tasks Completion Table

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Install/configure PostgreSQL, create test DB | Done | `lab_user` and `university_db` created on PG16 |
| 2 | Plain SQL `pg_dump` + MD5 check | Done | `/backup/logical/university16_full.sql`, `/backup/logical/university16_full.sql.md5` (`OK`) |
| 3 | Custom `pg_dump` (schema/data/full) | Done | `university16_custom.dump`, `university16_schema_only.dump`, `university16_data_only.dump` |
| 4 | Restore from plain SQL using `psql` | Done | `plain_restore_students=10`, `plain_restore_grades=10` |
| 5 | Restore from custom format using `pg_restore` | Done | `custom_restore_students=10`, `custom_restore_grades=10` |
| 6 | Selective restore of `grades` table | Done | `selective_grades_restore=10` |
| 7 | Physical backup using `pg_basebackup` | Done | `/backup/physical/base16_20260413` (`55M`) |
| 8 | Integrity checks with `amcheck` and `pgstattuple` | Done | 9 indexes checked; dead tuples = 0 for `students`, `grades` |
| 9 | Functional SQL checks (`JOIN`, `GROUP BY`) | Done | Distribution and average-grade reports returned expected rows |
| 10 | Fill results and prepare report | Done | This file |

## Key Validation Results

### Row Counts (baseline)

- `faculties = 5`
- `specialties = 9`
- `students = 10`
- `grades = 10`
- `subjects = 6`

### Recovery Validation

- After simulated damage (`TRUNCATE grades`, delete `course=1` students):  
  `students = 8`, `grades = 0`
- After plain restore:  
  `students = 10`, `grades = 10`
- After custom restore:  
  `students = 10`, `grades = 10`
- After selective `grades` restore:  
  `grades = 10`

### Integrity Validation

- FK checks:
  - invalid student->specialty links: `0`
  - invalid grade->student links: `0`
- Grade range violations: `0`
- `amcheck`: B-tree indexes checked: `9`, no errors
- `pgstattuple`:
  - `students`: `dead_tuple_count = 0`, `dead_tuple_percent = 0`
  - `grades`: `dead_tuple_count = 0`, `dead_tuple_percent = 0`

## Artifacts

- Logical backups:
  - `/backup/logical/university16_plain_20260413_084746.sql`
  - `/backup/logical/university16_full.sql`
  - `/backup/logical/university16_custom.dump`
  - `/backup/logical/university16_schema_only.dump`
  - `/backup/logical/university16_data_only.dump`
  - `/backup/logical/university16_custom.list`
  - `/backup/logical/university16_full.sql.md5`
- Physical backup:
  - `/backup/physical/base16_20260413`

## Conclusion

All 10 mandatory tasks were completed successfully on Ubuntu using PostgreSQL 16 local cluster.  
Backups (logical and physical), restore scenarios (full and selective), and data integrity checks all passed.
