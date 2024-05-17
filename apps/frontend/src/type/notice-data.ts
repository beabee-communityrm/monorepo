export interface NoticeData {
  name: string;
  starts: Date | null;
  expires: Date | null;
  text: string;
  buttonText?: string;
  url?: string;
}
