export interface AudioMetadata {
  id: string;
  mimetype: string;
  createdAt: Date;
  size: number;
  hash: string; // ETag/hash of the audio file, if available
  filename?: string | undefined; // Original filename, if available
  owner?: string | undefined; // Owner's contact email, if available
}
