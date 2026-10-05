import {
  ContributionPeriod,
  ContributionType,
  NewsletterStatus,
} from '@beabee/beabee-common';

import { sub } from 'date-fns';
import { describe, expect, it } from 'vitest';

import {
  Contact,
  ContactNewsletter,
  ContactProfile,
  ContactRole,
  Password,
} from '#models/index';
import type { ContactNewsletterUpdates } from '#type/index';

import { convertContactToNlUpdate } from './newsletter';

// Helper function to create a mock contact
function createMockContact(
  newsletterOverrides: ContactNewsletterUpdates = {},
  overrides: Partial<Contact> = {},
  activeMembership: boolean = false
): Contact {
  const contact: Contact = new Contact();
  Object.assign(contact, {
    id: 'contact-1',
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
    password: Password.none,
    joined: new Date('2023-01-01'),
    lastSeen: new Date('2023-12-01'),
    loginOverride: null,
    contributionType: ContributionType.None,
    contributionPeriod: null,
    contributionMonthlyAmount: null,
    referralCode: 'REF123',
    pollsCode: 'POLL456',
    roles: [],
    tags: [],
    ...overrides,
  });

  const mockProfile: ContactProfile = new ContactProfile();
  Object.assign(mockProfile, {
    contact,
    description: '',
    bio: '',
    notes: '',
    telephone: '',
    twitter: '',
    preferredContact: '',
    deliveryOptIn: false,
    deliveryAddress: null,
  });

  const mockNewsletter: ContactNewsletter = new ContactNewsletter();
  Object.assign(mockNewsletter, {
    contact,
    status: newsletterOverrides.status ?? NewsletterStatus.None,
    groups: newsletterOverrides.groups ?? [],
  });

  const mockMembership = new ContactRole();
  Object.assign(mockMembership, {
    contact,
    type: 'member',
    dateAdded: sub(new Date(), { months: 1 }),
    dateExpires: activeMembership ? null : sub(new Date(), { days: 1 }),
  });

  contact.profile = mockProfile;
  contact.newsletter = mockNewsletter;
  contact.roles.push(mockMembership);

  return contact;
}

describe('convertContactToNlUpdate', () => {
  describe('Basic functionality', () => {
    it('should return undefined when both current and new status are None', () => {
      const contact = createMockContact();
      const updates = {
        status: NewsletterStatus.None,
      };

      const result = convertContactToNlUpdate(contact, updates);

      expect(result).toBeUndefined();
    });

    it('should return undefined when current status is None and no updates provided', () => {
      const contact = createMockContact();

      const result = convertContactToNlUpdate(contact, {});

      expect(result).toBeUndefined();
    });

    it('should return update object when contact has non-None newsletter status', () => {
      const contact = createMockContact({
        status: NewsletterStatus.Subscribed,
        groups: ['group1'],
      });

      const result = convertContactToNlUpdate(contact);

      expect(result).toEqual({
        email: 'test@example.com',
        status: NewsletterStatus.Subscribed,
        firstname: 'John',
        lastname: 'Doe',
        fields: {
          REFCODE: 'REF123',
          POLLSCODE: 'POLL456',
          C_DESC: 'None',
          C_MNTHAMT: '',
          C_PERIOD: '',
        },
        isActiveMember: false,
        isActiveUser: false,
      });
    });

    it('should return update object when updates change status from None to active', () => {
      const contact = createMockContact();
      const updates: ContactNewsletterUpdates = {
        status: NewsletterStatus.Pending,
      };

      const result = convertContactToNlUpdate(contact, updates);

      expect(result).toEqual({
        email: 'test@example.com',
        status: NewsletterStatus.Pending,
        firstname: 'John',
        lastname: 'Doe',
        fields: {
          REFCODE: 'REF123',
          POLLSCODE: 'POLL456',
          C_DESC: 'None',
          C_MNTHAMT: '',
          C_PERIOD: '',
        },
        isActiveMember: false,
        isActiveUser: false,
      });
    });
  });

  describe('Newsletter status handling', () => {
    it('should prevent downgrade from Subscribed to Pending', () => {
      const contact = createMockContact({
        status: NewsletterStatus.Subscribed,
      });
      const updates: ContactNewsletterUpdates = {
        status: NewsletterStatus.Pending,
      };

      const result = convertContactToNlUpdate(contact, updates);

      expect(result?.status).toBe(NewsletterStatus.Subscribed);
    });

    it('should allow other status transitions', () => {
      const testCases = [
        { from: NewsletterStatus.Pending, to: NewsletterStatus.Subscribed },
        {
          from: NewsletterStatus.Subscribed,
          to: NewsletterStatus.Unsubscribed,
        },
        {
          from: NewsletterStatus.Unsubscribed,
          to: NewsletterStatus.Subscribed,
        },
        { from: NewsletterStatus.Pending, to: NewsletterStatus.Unsubscribed },
        { from: NewsletterStatus.Cleaned, to: NewsletterStatus.Pending },
      ];

      testCases.forEach(({ from, to }) => {
        const contact = createMockContact({ status: from });
        const updates: ContactNewsletterUpdates = {
          status: to,
        };

        const result = convertContactToNlUpdate(contact, updates);

        expect(result?.status).toBe(to);
      });
    });

    it('should use contact status when no updates provided', () => {
      const contact = createMockContact({
        status: NewsletterStatus.Subscribed,
      });

      const result = convertContactToNlUpdate(contact);

      expect(result?.status).toBe(NewsletterStatus.Subscribed);
    });

    it('should use updates status when provided', () => {
      const contact = createMockContact({
        status: NewsletterStatus.Pending,
      });
      const updates: ContactNewsletterUpdates = {
        status: NewsletterStatus.Subscribed,
      };

      const result = convertContactToNlUpdate(contact, updates);

      expect(result?.status).toBe(NewsletterStatus.Subscribed);
    });
  });

  describe('Group handling', () => {
    it('should leave groups untouched when no group updates provided', () => {
      const contact = createMockContact({
        status: NewsletterStatus.Subscribed,
        groups: ['group1', 'group2'],
      });

      const result = convertContactToNlUpdate(contact);

      expect(result?.groups).toBeUndefined();
    });

    it('should replace groups when updates provided without a change type', () => {
      const contact = createMockContact({
        status: NewsletterStatus.Subscribed,
        groups: ['group1', 'group2'],
      });
      const updates: ContactNewsletterUpdates = {
        groups: ['group3', 'group4'],
      };

      const result = convertContactToNlUpdate(contact, updates);

      expect(result?.groups).toEqual(['group3', 'group4']);
      expect(result?.newsletterGroupChange).toBeUndefined();
    });

    it('should pass newsletterGroupChange through to the update', () => {
      const contact = createMockContact({
        status: NewsletterStatus.Subscribed,
      });
      const updates: ContactNewsletterUpdates = {
        groups: ['group1'],
      };

      const result = convertContactToNlUpdate(contact, updates, {
        newsletterGroupChange: 'remove',
      });

      expect(result?.newsletterGroupChange).toBe('remove');
    });
  });

  describe('Fields mapping', () => {
    it('should map contribution information correctly', () => {
      const contact = createMockContact(
        {
          status: NewsletterStatus.Subscribed,
        },
        {
          contributionType: ContributionType.Automatic,
          contributionMonthlyAmount: 25.5,
          contributionPeriod: ContributionPeriod.Monthly,
        }
      );

      const result = convertContactToNlUpdate(contact);

      expect(result?.fields.C_MNTHAMT).toBe('25.50');
      expect(result?.fields.C_PERIOD).toBe('monthly');
    });

    it('should handle null contribution values', () => {
      const contact = createMockContact(
        {
          status: NewsletterStatus.Subscribed,
        },
        {
          contributionType: ContributionType.None,
          contributionMonthlyAmount: null,
          contributionPeriod: null,
        }
      );

      const result = convertContactToNlUpdate(contact);

      expect(result?.fields.C_MNTHAMT).toBe('');
      expect(result?.fields.C_PERIOD).toBe('');
    });
  });

  describe('Member and user status flags', () => {
    it('should correctly identify active member', () => {
      const contact = createMockContact(
        {
          status: NewsletterStatus.Subscribed,
        },
        undefined,
        true
      );

      const result = convertContactToNlUpdate(contact);

      expect(result?.isActiveMember).toBe(true);
    });

    it('should correctly identify inactive member', () => {
      const contact = createMockContact({
        status: NewsletterStatus.Subscribed,
      });

      const result = convertContactToNlUpdate(contact);

      expect(result?.isActiveMember).toBe(false);
    });

    it('should correctly identify active user (has password)', () => {
      const contact = createMockContact(
        {
          status: NewsletterStatus.Subscribed,
        },
        {
          password: { hash: 'hashedpassword' } as Password,
        }
      );

      const result = convertContactToNlUpdate(contact);

      expect(result?.isActiveUser).toBe(true);
    });

    it('should correctly identify inactive user (no password)', () => {
      const contact = createMockContact({
        status: NewsletterStatus.Subscribed,
      });

      const result = convertContactToNlUpdate(contact);

      expect(result?.isActiveUser).toBe(false);
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('should handle complex status and group updates with add change', () => {
      const contact = createMockContact({
        status: NewsletterStatus.Pending,
        groups: ['oldGroup1', 'oldGroup2'],
      });
      const updates: ContactNewsletterUpdates = {
        status: NewsletterStatus.Subscribed,
        groups: ['newGroup1', 'oldGroup1'],
      };

      const result = convertContactToNlUpdate(contact, updates, {
        newsletterGroupChange: 'add',
      });

      expect(result?.status).toBe(NewsletterStatus.Subscribed);
      expect(result?.groups).toEqual(['newGroup1', 'oldGroup1']);
    });

    it('should handle contact with minimal data', () => {
      const contact = createMockContact(
        {
          status: NewsletterStatus.Subscribed,
          groups: [],
        },
        {
          email: 'min@test.com',
          firstname: '',
          lastname: '',
          referralCode: null,
          pollsCode: null,
          contributionType: ContributionType.None,
          contributionMonthlyAmount: null,
          contributionPeriod: null,
        }
      );

      const result = convertContactToNlUpdate(contact);

      expect(result).toEqual({
        email: 'min@test.com',
        status: NewsletterStatus.Subscribed,
        firstname: '',
        lastname: '',
        fields: {
          REFCODE: '',
          POLLSCODE: '',
          C_DESC: 'None',
          C_MNTHAMT: '',
          C_PERIOD: '',
        },
        isActiveMember: false,
        isActiveUser: false,
      });
    });
  });
});
