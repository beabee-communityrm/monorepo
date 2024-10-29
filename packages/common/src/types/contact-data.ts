export interface ContactData {
  email: string;
  firstname: string;
  lastname: string;
  // TODO: Add support for tags
  tags?: string[];
  // Added by deserializer
  displayName: string;
}
