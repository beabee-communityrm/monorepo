export interface CalloutData {
  slug: string | null;
  image: string;
  starts: Date | null;
  expires: Date | null;
  allowUpdate: boolean;
  allowMultiple: boolean;
  access: 'member' | 'guest' | 'anonymous' | 'only-anonymous';
  captcha: 'all' | 'guest' | 'none';
  hidden: boolean;
}
