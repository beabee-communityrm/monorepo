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

exit 0


# Create test payments
echo "Creating test payments..."
for amount in 10 20 30 40 50 60 70 80 90 100; do
    period="monthly"
    if [ $amount -ge 60 ]; then
        period="annually"
    fi
    yarn backend-cli payment create --email "$TEST_USER_EMAIL" --amount $amount --period $period
done

echo "✅ Test data setup completed successfully"

# Output the API key so it can be captured by the calling script
echo "API_KEY=$API_KEY"
