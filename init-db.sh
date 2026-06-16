#!/bin/bash
# Create both databases on Postgres first boot
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE cymed_erp;
    GRANT ALL PRIVILEGES ON DATABASE cymed_erp TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE cymed_clinical TO $POSTGRES_USER;
EOSQL

echo "✓ Both CyMed databases initialized: cymed_clinical (Django) + cymed_erp (ERP engine)"
