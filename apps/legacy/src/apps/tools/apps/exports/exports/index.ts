import ActiveMembersExport from './ActiveMembersExport.js';
import EditionExport from './EditionExport.js';
import GiftsExport from './GiftsExport.js';
import ReferralsExport from './ReferralsExport.js';

export default {
  'active-members': ActiveMembersExport,
  edition: EditionExport,
  gifts: GiftsExport,
  referrals: ReferralsExport,
} as const;
