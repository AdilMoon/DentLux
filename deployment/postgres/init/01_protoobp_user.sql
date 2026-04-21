DO
$$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'protoobp') THEN
    CREATE ROLE protoobp LOGIN PASSWORD 'protoobp';
  ELSE
    ALTER ROLE protoobp WITH LOGIN PASSWORD 'protoobp';
  END IF;
END
$$;

GRANT pg_monitor TO protoobp;
GRANT SELECT ON pg_stat_database TO protoobp;
