import { NotFoundError } from '@beabee/core/errors';
import { log as mainLogger } from '@beabee/core/logging';

import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const log = mainLogger.child({ app: 's3-utils' });

/**
 * Checks the connection to S3/MinIO
 * @param s3Client The S3Client instance
 * @param bucket The bucket to check
 * @returns True if the connection is successful
 */
export async function checkConnection(
  s3Client: S3Client,
  bucket: string
): Promise<boolean> {
  try {
    await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        MaxKeys: 1,
      })
    );
    return true;
  } catch (error) {
    log.error('S3/MinIO connection check failed:', error);
    return false;
  }
}

/**
 * Gets metadata for a file in S3/MinIO
 * @param s3Client The S3Client instance
 * @param bucket The bucket to check
 * @param key The key of the file
 * @returns The metadata of the file
 */
export async function getFileMetadata(
  s3Client: S3Client,
  bucket: string,
  key: string
): Promise<{
  id: string;
  mimetype: string;
  createdAt: Date;
  size: number;
}> {
  const response = await s3Client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!response.ContentType || !response.LastModified) {
    throw new NotFoundError();
  }

  // Extract the ID from the key (removing the prefix)
  const id = key.split('/').pop() || '';

  return {
    id,
    mimetype: response.ContentType,
    createdAt: response.LastModified,
    size: response.ContentLength || 0,
  };
}

/**
 * Checks if a file exists in S3/MinIO
 * @param s3Client The S3Client instance
 * @param bucket The bucket to check
 * @param key The key of the file
 * @returns True if the file exists
 */
export async function fileExists(
  s3Client: S3Client,
  bucket: string,
  key: string
): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets a file as a buffer from S3/MinIO
 * @param s3Client The S3Client instance
 * @param bucket The bucket to check
 * @param key The key of the file
 * @returns The file buffer and content type
 */
export async function getFileBuffer(
  s3Client: S3Client,
  bucket: string,
  key: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const { Body, ContentType } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!Body || !ContentType) {
    throw new NotFoundError();
  }

  // Read the stream into a buffer
  const chunks: Buffer[] = [];
  // @ts-ignore - Body is a stream
  for await (const chunk of Body) {
    chunks.push(Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);

  return { buffer, contentType: ContentType };
}

/**
 * Gets a file as a stream from S3/MinIO
 * @param s3Client The S3Client instance
 * @param bucket The bucket to check
 * @param key The key of the file
 * @returns The file stream and content type
 */
export async function getFileStream(
  s3Client: S3Client,
  bucket: string,
  key: string
): Promise<{ stream: Readable; contentType: string }> {
  const { Body, ContentType } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!Body || !ContentType) {
    throw new NotFoundError();
  }

  return {
    stream: Body as Readable,
    contentType: ContentType,
  };
}

/**
 * Gets the hash (ETag) of a file in S3/MinIO without downloading the file
 * @param s3Client The S3Client instance
 * @param bucket The bucket to check
 * @param key The key of the file
 * @returns The hash (ETag) of the file with quotes removed
 */
export async function getFileHash(
  s3Client: S3Client,
  bucket: string,
  key: string
): Promise<string> {
  const response = await s3Client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!response.ETag) {
    throw new NotFoundError();
  }

  // Remove quotes from ETag
  return response.ETag.replace(/"/g, '');
}
