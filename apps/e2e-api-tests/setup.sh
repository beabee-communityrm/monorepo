#!/bin/bash

set -e  # Exit on any error

echo "🧪 Setting up test data..."

# Create test user
echo "Creating test user..."
yarn backend-cli user create --firstname "$TEST_USER_FIRSTNAME" --lastname "$TEST_USER_LASTNAME" --email "$TEST_USER_EMAIL" --password "$TEST_USER_PASSWORD" --role "$TEST_USER_ROLE"

# Create rate limit test user
echo "Creating rate limit test user..."
yarn backend-cli user create --firstname "$TEST_RATE_LIMIT_USER_FIRSTNAME" --lastname "$TEST_RATE_LIMIT_USER_LASTNAME" --email "$TEST_RATE_LIMIT_USER_EMAIL" --password "$TEST_RATE_LIMIT_USER_PASSWORD" --role "$TEST_RATE_LIMIT_USER_ROLE"

# Create test API key and capture the token
echo "Creating test API key..."
API_KEY_OUTPUT=$(yarn backend-cli api-key create --description "$TEST_API_KEY_DESCRIPTION" --email "$TEST_USER_EMAIL")
API_KEY=$(echo "$API_KEY_OUTPUT" | grep "Token:" | awk '{print $2}')

if [ -z "$API_KEY" ]; then
    echo "❌ Failed to create test API key"
    echo "$API_KEY_OUTPUT"
    exit 1
fi

echo "✅ Test API key created: $API_KEY"

# Output the API key so it can be captured by the calling script
echo "API_KEY=$API_KEY"

# Import test database
echo "Importing test database..."
if [ -f "/opt/packages/core/src/migrations/test-data-dump.sql" ]; then
  yarn backend-cli database import --merge --file /opt/packages/core/src/migrations/test-data-dump.sql || {
    echo "Failed to import test data"
    exit 1
  }
else
  echo "Test database not found at /opt/packages/core/src/migrations/test-data-dump.sql - skipping import"
fi

exit 0