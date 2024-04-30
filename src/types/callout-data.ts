export interface CalloutData {
  slug: string | null;
  title: string;
  excerpt: string;
  image: string;
  starts: Date | null;
  expires: Date | null;
  allowUpdate: boolean;
  allowMultiple: boolean;
  access: "member" | "guest" | "anonymous" | "only-anonymous";
  hidden: boolean;
}
