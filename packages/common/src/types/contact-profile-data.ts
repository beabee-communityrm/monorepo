import type { Address } from './index.js';

export interface ContactProfileData {
  telephone: string;
  twitter: string;
  organisation: string;
  vatNumber: string;
  preferredContact: string;
  deliveryOptIn: boolean;
  deliveryAddress: Address | null;

  // Admin only
  notes?: string;
  description?: string;
}
