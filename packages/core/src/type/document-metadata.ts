export interface DocumentMetadata {
  id: string;
  mimetype: string;
  createdAt: Date;
  size: number;
  filename?: string | undefined; // Original filename, if available
}
