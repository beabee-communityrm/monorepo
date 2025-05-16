FROM minio/minio:RELEASE.2025-04-22T22-12-26Z

# MinIO Client is already included in the image, no need to download it

# Add our initialization script
COPY apps/minio/init-bucket.sh /usr/bin/init-bucket.sh
RUN chmod +x /usr/bin/init-bucket.sh

# Health check with a start period of 30 seconds to allow for bucket initialisation
HEALTHCHECK --interval=30s --timeout=20s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:9000/minio/health/live || exit 1

# Use our initialization script as the entrypoint
ENTRYPOINT ["/usr/bin/init-bucket.sh"]

# Extend the original CMD ("minio") with our parameters for immediate usability
CMD ["minio", "server", "/data", "--console-address", ":9001"] 
