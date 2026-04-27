#!/bin/bash

set -e  # Exit on any error

echo "🧪 Importing test data..."

# locate and import test data dump
if [ -f "/opt/packages/core/src/migrations/test-data-dump.sql" ]; then
  yarn backend-cli database import --file /opt/packages/core/src/migrations/test-data-dump.sql || {
    echo "Failed to import test data"
    exit 1
  }
else
  echo "Test database not found at /opt/packages/core/src/migrations/test-data-dump.sql - skipping import"
fi

exit 0