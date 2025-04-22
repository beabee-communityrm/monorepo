import { promisify } from "util";
import multer from "multer";

// Promisify multer middleware
export const uploadMiddleware = promisify(
  multer({
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
      files: 1
    }
  }).single("file")
);
