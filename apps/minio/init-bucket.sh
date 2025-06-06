#!/bin/sh
set -e

# Start MinIO server in the background using original entrypoint with passed arguments
/usr/bin/docker-entrypoint.sh "$@" &
MINIO_PID=$!

# Wait for MinIO to be available
echo "Waiting for MinIO to start..."
RETRIES=60
until (echo > /dev/tcp/localhost/9000) >/dev/null 2>&1; do
  sleep 1
  RETRIES=$((RETRIES-1))
  if [ $RETRIES -le 0 ]; then
    echo "MinIO did not start in time."
    exit 1
  fi
done

# Initialize MinIO buckets if BEABEE_MINIO_BUCKET is set
if [ -n "${BEABEE_MINIO_BUCKET}" ]; then
  echo "Initializing bucket: ${BEABEE_MINIO_BUCKET}"
  
  # Set up the MinIO client alias
  mc alias set myminio http://localhost:9000 "${MINIO_ROOT_USER:-minioadmin}" "${MINIO_ROOT_PASSWORD:-minioadmin}"
  
  # Create bucket if it doesn't exist
  mc mb --ignore-existing myminio/"${BEABEE_MINIO_BUCKET}"
  
  echo "Bucket initialization completed"
fi

# Bring the MinIO process to foreground
echo "MinIO server is running..."
wait $MINIO_PID