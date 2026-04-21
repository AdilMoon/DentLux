#!/usr/bin/env bash

# Connection settings for demo scripts
export PGHOST="localhost"
export PGPORT="55432"
export PGDATABASE="university_db"
export PGUSER="lab_user"
export PGPASSWORD="Lab@2025!"

# Backup artifacts
export PLAIN_BACKUP="/backup/logical/university16_full.sql"
export CUSTOM_BACKUP="/backup/logical/university16_custom.dump"

# Physical backup/restore settings (local PostgreSQL 16 cluster)
export PG_CLUSTER_SERVICE="postgresql@16-main"
export PG_LOCAL_PORT="55432"
export PGDATA_DIR="/var/lib/postgresql/16/main"
export PHYSICAL_BACKUP_ROOT="/backup/physical"

# Replication user for pg_basebackup
export REPL_USER="replicator"
export REPL_PASSWORD="Repl@2025!"
