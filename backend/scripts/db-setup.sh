#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# db-setup.sh
# Creates the PostgreSQL user, database, and grants the correct permissions.
# Run this once before your first migration.
#
# Usage:
#   bash scripts/db-setup.sh
#
# Requires psql and a local PostgreSQL server running.
# Connects as the 'postgres' superuser — enter its password if prompted.
# ---------------------------------------------------------------------------

set -e

DB_USER="zannu"
DB_PASS="zameron14"
DB_NAME="ndova_db"

echo "Setting up PostgreSQL for Ndova..."

psql -U postgres <<EOF

-- 1. Create the role if it doesn't exist yet
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE "${DB_USER}" WITH LOGIN PASSWORD '${DB_PASS}';
    RAISE NOTICE 'Role "${DB_USER}" created.';
  ELSE
    -- Make sure the password is correct
    ALTER ROLE "${DB_USER}" WITH PASSWORD '${DB_PASS}';
    RAISE NOTICE 'Role "${DB_USER}" already exists — password updated.';
  END IF;
END
\$\$;

-- 2. Create the database if it doesn't exist yet
SELECT 'CREATE DATABASE "${DB_NAME}" OWNER "${DB_USER}"'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = '${DB_NAME}'
)\gexec

-- 3. Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "${DB_USER}";

\echo 'Connecting to ${DB_NAME} to fix schema permissions...'

EOF

# Connect to the target database to fix public schema permissions
# (PostgreSQL 15+ revoked CREATE on public schema from PUBLIC by default)
psql -U postgres -d "$DB_NAME" <<EOF

-- 4. Grant schema-level permissions (required in PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO "${DB_USER}";
ALTER SCHEMA public OWNER TO "${DB_USER}";

EOF

echo ""
echo "Done! You can now run:"
echo "  npm run db:migrate"
echo "  npm run db:seed"
