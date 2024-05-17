export interface GetCalloutResponseData {
  id: string;
  number: number;
  createdAt: Date;
  updatedAt: Date;
  bucket: string;
  guestName: string | null;
  guestEmail: string | null;
}
