#!/bin/bash

# Load environment variables
set -a
source .env
source .env.test
set +a

# Set a unique project name for e2e tests to avoid conflicts
COMPOSE_PROJECT_NAME="beabee-e2e-tests"
export COMPOSE_PROJECT_NAME

# Global cleanup function - ALWAYS runs at the end
global_cleanup() {
    echo "🧹 Performing global cleanup..."

    docker compose -f docker-compose.test.yml logs > last-e2e-api-run.log

    echo "Bringing down Docker Compose stack..."
    docker compose -f docker-compose.test.yml down -v --remove-orphans

    echo "✅ Cleanup completed"
}

# Trap signals to ensure cleanup happens
trap global_cleanup EXIT INT TERM HUP QUIT ABRT

# Function to wait for a service to be ready
await_service_ready() {
    local service_name=$1
    local log_pattern=$2
    local max_attempts=60
    local attempt=1
    
    echo "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose logs $service_name 2>/dev/null | grep -q "$log_pattern"; then
            echo "✅ $service_name is ready"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            echo "❌ $service_name failed to become ready"
            docker compose logs $service_name
            return 1
        fi
        
        sleep 5
        attempt=$((attempt + 1))
    done
}

# Start the Docker Compose stack with a separate project name
echo "🚀 Starting Docker Compose environment (project: $COMPOSE_PROJECT_NAME)..."
docker compose -f docker-compose.test.yml up -d --build

# Wait for services to be ready
await_service_ready "api_app" "Server is ready and listening on port 3000" || exit 1

# Run setup script inside api_app container to create test data
echo "🧪 Running test data setup..."
API_KEY=$(cat apps/e2e-api-tests/setup.sh | docker compose exec -T api_app bash)

# Extract API_KEY from the setup output
API_KEY=$(echo "$API_KEY" | grep "API_KEY=" | cut -d'=' -f2)

if [ -z "$API_KEY" ]; then
    echo "❌ Failed to create test API key"
    docker compose logs api_app
    exit 1
fi

echo "✅ Test API key created: $API_KEY"
echo "✅ Setup completed successfully"

# Run the tests
echo "🧪 Running tests..."
docker compose exec api_app bash -c "cd /opt/apps/e2e-api-tests && API_KEY=$API_KEY yarn test"

# Get exit code from tests
TEST_EXIT_CODE=$?

# Note: global_cleanup() will be called automatically by the trap
exit $TEST_EXIT_CODE
