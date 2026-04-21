# Lab 12 Demo: Delete and Restore

This folder contains ready-to-run scripts so you can personally show:

1) current DB state  
2) data damage (delete/truncate)  
3) restore from plain backup  
4) restore from custom backup  
5) selective restore of `grades` only
6) physical backup and physical restore

## 1) Configure connection once

Edit `env.sh` if needed. Current defaults match your lab setup:

- host: `localhost`
- port: `55432`
- database: `university_db`
- user: `lab_user`
- password: `Lab@2025!`

## 2) Run demo in terminal

From project root:

```bash
cd deployment/postgres/lab12-demo
./01_show_state.sh
./02_damage.sh
./01_show_state.sh
./03_restore_plain.sh
./01_show_state.sh
./02_damage.sh
./04_restore_custom.sh
./01_show_state.sh
./02_damage.sh
./05_restore_grades_only.sh
./06_verify_grades_only.sh
```

Physical backup/restore demo:

```bash
./09_list_physical_backups.sh
./07_physical_backup.sh
./09_list_physical_backups.sh
# optional destructive demo (requires sudo, asks confirmation):
./08_physical_restore.sh
```

## 3) What to show in pgAdmin

Open Query Tool for `university_db` and run:

```sql
SELECT 'students' AS t, COUNT(*) FROM students
UNION ALL
SELECT 'grades', COUNT(*) FROM grades
ORDER BY t;
```

Then run `02_damage.sh`, refresh, and show reduced counts.  
Then run one of restore scripts and show counts restored.

## Notes

- Backups used by scripts:
  - `/backup/logical/university16_full.sql`
  - `/backup/logical/university16_custom.dump`
- Physical backups:
  - `/backup/physical/base16_*`
- If your environment changed, edit paths in scripts.
