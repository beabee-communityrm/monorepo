import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  S3ClientConfig,
  HeadBucketCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { createReadStream } from "fs";
import config from "#config/config";
import { BadRequestError } from "../errors";

export interface S3Config {
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export class S3Service {
  private s3Client: S3Client = {} as S3Client;
  private bucket: string;

  constructor(s3Config?: Partial<S3Config>) {
    // Merge provided config with defaults
    const endpoint = s3Config?.endpoint || config.minio.endpoint;
    const region = s3Config?.region || config.minio.region || "us-east-1";
    const accessKey = s3Config?.accessKey || config.minio.accessKey;
    const secretKey = s3Config?.secretKey || config.minio.secretKey;
    this.bucket = s3Config?.bucket || config.minio.bucket;

    // Initialize S3 client
    this.initializeS3Client(endpoint, region, accessKey, secretKey);
  }

  /**
   * Initialize S3 client with configuration
   * @param endpoint S3 endpoint URL
   * @param region S3 region
   * @param accessKey S3 access key
   * @param secretKey S3 secret key
   */
  private initializeS3Client(
    endpoint: string,
    region: string,
    accessKey: string,
    secretKey: string
  ): void {
    const s3Config: S3ClientConfig = {
      endpoint,
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey
      },
      forcePathStyle: true
    };

    this.s3Client = new S3Client(s3Config);
  }

  /**
   * Checks if an S3 bucket exists and is accessible
   * @param bucket Bucket name to check (defaults to the configured bucket)
   * @throws Error if bucket doesn't exist or is not accessible
   */
  async checkBucketExists(bucket?: string): Promise<void> {
    const bucketName = bucket || this.bucket;
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error) {
      throw new BadRequestError({
        message: `Bucket '${bucketName}' not found or not accessible`
      });
    }
  }

  /**
   * Checks if a file exists in S3
   * @param key Object key
   * @param bucket Optional bucket name (defaults to configured bucket)
   * @returns Whether the file exists
   */
  async checkFileExists(key: string, bucket?: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: bucket || this.bucket,
          Key: key
        })
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Upload a buffer to S3
   * @param key The object key
   * @param buffer The buffer to upload
   * @param contentType The content type
   */
  async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType
      })
    );
  }

  /**
   * Uploads a file to S3
   * @param key Object key
   * @param filePath Path to local file
   * @param contentType The content type
   */
  async uploadFile(
    key: string,
    filePath: string,
    contentType: string
  ): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: createReadStream(filePath),
        ContentType: contentType
      })
    );
  }

  /**
   * Get a file stream from storage
   * @param key The file key
   * @returns Readable stream of the file
   */
  async getFileStream(key: string): Promise<Readable> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key
        })
      );

      return response.Body as Readable;
    } catch (error) {
      console.error("Error getting file stream:", error);
      throw new BadRequestError({ message: "Failed to get file" });
    }
  }

  /**
   * Delete a file from S3
   * @param key The key of the file to delete
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key
        })
      );
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new BadRequestError({ message: "Failed to delete file" });
    }
  }

  /**
   * Get the bucket name
   * @returns The current bucket name
   */
  getBucket(): string {
    return this.bucket;
  }
}

export default S3Service;
