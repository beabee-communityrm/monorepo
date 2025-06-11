import { promisify } from 'util';
import multer from 'multer';
import { MAX_FILE_SIZE_IN_BYTES } from '@beabee/beabee-common';

// Promisify multer middleware
export const uploadMiddleware = promisify(
  multer({
    limits: {
      fileSize: MAX_FILE_SIZE_IN_BYTES,
      files: 1,
    },
  }).single('file')
);
