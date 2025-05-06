# BeaBee MinIO Service

This custom MinIO Docker image provides S3-compatible object storage for Beabee with automatic bucket initialization.

## Features

- S3-compatible object storage for file uploads
- Pre-configured to automatically create and configure buckets at startup
- Based on the official MinIO container with added initialization capabilities

## Environment Variables

The service uses the following environment variables:

| Variable                     | Description                          | Default             |
| ---------------------------- | ------------------------------------ | ------------------- |
| `BEABEE_MINIO_ROOT_USER`     | MinIO root user (admin username)     | `minioadmin`        |
| `BEABEE_MINIO_ROOT_PASSWORD` | MinIO root password (admin password) | `minioadmin`        |
| `BEABEE_MINIO_BUCKET`        | MinIO bucket name for file uploads   | `uploads`           |
| `BEABEE_MINIO_REGION`        | MinIO region (S3 compatibility)      | `us-east-1`         |
| `BEABEE_MINIO_ENDPOINT`      | MinIO server endpoint URL            | `http://minio:9000` |
| `BEABEE_MINIO_PORT_ADMIN`    | MinIO Admin port                     | `9000`              |
| `BEABEE_MINIO_PORT_CONSOLE`  | MinIO Console port (Admin UI)        | `9001`              |

## Implementation

This service uses the official MinIO Docker image which already includes both the MinIO server and MinIO client (mc). Our customization:

1. Uses a custom initialization script as the container's ENTRYPOINT
2. Extends the original CMD (which is only `["minio"]`) with server parameters for immediate usability: 
   `["minio", "server", "/data", "--console-address", ":9001"]`
3. The initialization script:
   - Starts MinIO in the background by passing all received arguments to the original entrypoint
   - Waits for MinIO to become available
   - Initializes the specified bucket using the pre-installed mc client
   - Sets appropriate permissions (download access)
   - Brings MinIO to the foreground to keep the container running

This approach provides several advantages:
- Clean separation of concerns (initialization separate from server configuration)
- Flexible configuration through standard Docker CMD options
- Automatic bucket initialization on startup
- Maintains compatibility with MinIO updates
- Ready to use with sensible defaults

## Docker Compose

In the docker-compose.yml file, `BEABEE_MINIO_*` variables are mapped to their corresponding `MINIO_*` variables that the MinIO service expects. 

## License

AGPL-3.0 - see the [LICENSE](../../LICENSE) file for details.

## Links

- [GitHub Repository](https://github.com/beabee-communityrm/monorepo)
- [Issues](https://github.com/beabee-communityrm/monorepo/issues)
