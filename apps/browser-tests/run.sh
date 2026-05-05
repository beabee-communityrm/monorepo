#!/bin/bash

# Create directory for logs
LOG_DIR="logs/e2e-test-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$LOG_DIR"

exec > >(tee -a "$LOG_DIR/test.log") 2>&1

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
    echo "-- 🧹 CLEANING UP --"

    docker compose -f docker-compose.test.yml logs >> "$LOG_DIR/docker-compose.log" # Export Docker log

    echo "Bringing down Docker Compose stack..."
    docker compose -f docker-compose.test.yml down -v --remove-orphans

    echo "Finished cleanup. Log directory: $LOG_DIR"
    exit
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
            docker compose logs $service_name >> "$LOG_DIR/docker-compose.log"
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
#await_service_ready "frontend" "signal process started" || exit 1

echo "🧪 Importing test data..."
docker compose exec -T api_app yarn backend-cli database import < ./apps/browser-tests/src/fixtures/test-db-default.sql
docker compose exec -T api_app yarn backend-cli database import < ./apps/browser-tests/src/fixtures/test-db-custom.sql

#docker compose exec api_app bash -c "cd /opt/apps/e2e-api-tests && API_KEY=$API_KEY yarn test"

# Run browser tests
echo "Running browser tests.."
export PLAYWRIGHT_BASE_URL=http://localhost:$ROUTER_PORT
yarn workspace @beabee/browser-tests test

BROWSER_TEST_EXIT_CODE=$?

# Copy Playwright logs to log directory
if [ -d "apps/browser-tests/test-results" ]; then
    cp -r apps/browser-tests/test-results "$LOG_DIR/"
else
    echo "Playwright test results not found"
fi

exit $BROWSER_TEST_EXIT_CODE