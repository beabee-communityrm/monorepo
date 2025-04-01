import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";

import { getContentType } from "./files.js";

/**
 * Creates an S3 client
 * @param endpoint S3 endpoint URL
 * @param region S3 region
 * @param accessKey S3 access key
 * @param secretKey S3 secret key
 * @returns Configured S3 client
 */
export function createS3Client(
  endpoint: string,
  region: string,
  accessKey: string,
  secretKey: string
): S3Client {
  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey
    },
    forcePathStyle: true
  });
}

/**
 * Checks if an S3 bucket exists and is accessible
 * @param s3Client S3 client
 * @param bucket Bucket name
 * @throws Error if bucket doesn't exist or is not accessible
 */
export async function checkBucketExists(
  s3Client: S3Client,
  bucket: string
): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(chalk.green(`✓ Connected to bucket '${bucket}'`));
  } catch (error) {
    console.error(
      chalk.red(`Error: Bucket '${bucket}' not found or not accessible`)
    );
    console.error(
      "Please make sure the bucket exists and you have the correct permissions"
    );
    throw error;
  }
}

/**
 * Checks if a file exists in S3
 * @param s3Client S3 client
 * @param bucket Bucket name
 * @param key Object key
 * @returns Whether the file exists
 */
export async function checkFileExists(
  s3Client: S3Client,
  bucket: string,
  key: string
): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key
      })
    );
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Uploads a file to S3
 * @param s3Client S3 client
 * @param bucket Bucket name
 * @param key Object key
 * @param filePath Path to local file
 */
export async function uploadFileToS3(
  s3Client: S3Client,
  bucket: string,
  key: string,
  filePath: string
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: createReadStream(filePath),
      ContentType: getContentType(filePath)
    })
  );
}
