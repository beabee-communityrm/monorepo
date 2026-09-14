import type { UploadFileResponse } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import {
  BadRequestError,
  UnauthorizedError,
  UnsupportedFileTypeError,
} from '@beabee/core/errors';
import { Contact } from '@beabee/core/models';
import type { FileMetadata } from '@beabee/core/type';

import { Request, Response } from 'express';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import { uploadMiddleware } from '../middlewares/index.js';

/**
 * Shared upload/get/delete logic for the file-backed controllers (Audio,
 * Document, Image) - not itself a routing-controllers controller. Route and
 * param decorators (@Get, @Param, @Req, ...) must stay on the concrete
 * subclass's own methods: routing-controllers rewrites an inherited action's
 * target to the subclass but still looks up its params under whichever
 * class the decorators were physically written on, so a decorated method
 * living only on this base class would resolve every param as undefined.
 * Subclasses instead supply the type-specific pieces below and each add a
 * thin decorated wrapper that calls the matching handle* method here.
 */
export abstract class FileController<TMetadata extends FileMetadata> {
  /** Human-readable name used in error messages, e.g. "audio" */
  protected abstract readonly typeName: string;
  /** URL path segment files of this type are served under, e.g. "audio" */
  protected abstract readonly pathPrefix: string;
  protected abstract readonly allowedMimeTypes: string[];
  protected abstract readonly contentSecurityPolicy: string;

  protected abstract isSupportedType(mimetype: string): boolean;
  protected abstract uploadFile(
    stream: Readable,
    filename: string,
    mimetype: string,
    owner?: string
  ): Promise<TMetadata>;
  protected abstract getFileMetadata(id: string): Promise<TMetadata>;
  protected abstract getFileStream(
    id: string,
    width?: number
  ): Promise<{ stream: Readable; contentType: string }>;
  protected abstract deleteFile(id: string): Promise<boolean>;

  protected async handleUpload(
    req: Request,
    ownerEmail?: string
  ): Promise<UploadFileResponse> {
    const file = await uploadMiddleware(req);

    if (!file) {
      throw new BadRequestError(`No ${this.typeName} file provided`);
    }

    // Verify file type is allowed before consuming the stream
    if (!this.isSupportedType(file.mimetype)) {
      file.stream.resume(); // Drain the stream so the request completes
      throw new UnsupportedFileTypeError(file.mimetype, this.allowedMimeTypes);
    }

    const metadata = await this.uploadFile(
      file.stream,
      file.filename,
      file.mimetype,
      ownerEmail
    );

    const path = `${this.pathPrefix}/${metadata.id}`;

    const response: UploadFileResponse = {
      id: metadata.id,
      url: `${config.audience}/api/1.0/${path}`,
      path,
      hash: metadata.hash,
    };

    // Only add filename if it exists
    if (metadata.filename) {
      response.filename = metadata.filename;
    }

    return response;
  }

  protected async handleGet(
    res: Response,
    id: string,
    width?: number
  ): Promise<Response> {
    // Get the filename first, this also throws if the file doesn't exist
    const metadata = await this.getFileMetadata(id);

    const fileData = await this.getFileStream(id, width);

    // Set appropriate security headers
    res.set({
      'Content-Type': fileData.contentType,
      'Content-Disposition': `inline; filename="${metadata.filename || id}"`,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': this.contentSecurityPolicy,
      'X-Frame-Options': 'SAMEORIGIN',
    });

    // Stream the file to the response
    try {
      await pipeline(fileData.stream, res);
    } catch (error) {
      if (!res.headersSent) {
        throw new BadRequestError(`Failed to stream ${this.typeName} (${id})`);
      }
      // Too late for an error response, abort the connection
      res.destroy();
    }

    // Returning the response object tells routing-controllers the response
    // has been handled
    return res;
  }

  protected async handleDelete(
    id: string,
    contact: Contact
  ): Promise<{ success: boolean }> {
    // Get metadata first to check ownership
    const metadata = await this.getFileMetadata(id);

    // Only allow the file's owner or admins to delete it
    if (
      metadata.owner &&
      metadata.owner !== contact.email &&
      !contact.hasRole('admin')
    ) {
      throw new UnauthorizedError();
    }

    const success = await this.deleteFile(id);
    return { success };
  }
}
