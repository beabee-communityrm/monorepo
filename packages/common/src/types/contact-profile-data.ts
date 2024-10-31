import type { NewsletterStatus } from "../data/index.ts";
import type { Address } from "./index.ts";

export interface ContactProfileData {
  telephone: string;
  twitter: string;
  preferredContact: string;
  deliveryOptIn: boolean;
  deliveryAddress: Address | null;
  newsletterStatus: NewsletterStatus;
  newsletterGroups: string[];

  // Admin only
  notes?: string;
  description?: string;
}
