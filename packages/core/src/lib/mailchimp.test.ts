import { NewsletterStatus } from '@beabee/beabee-common';

import { describe, expect, it, vi } from 'vitest';

import OptionsService from '#services/OptionsService';
import type { UpdateNewsletterContact } from '#type/index';

import { nlContactToMCMember } from './mailchimp.js';

function createUpdate(
  overrides: Partial<UpdateNewsletterContact> = {}
): UpdateNewsletterContact {
  return {
    email: 'test@example.com',
    status: NewsletterStatus.Subscribed,
    firstname: 'John',
    lastname: 'Doe',
    fields: {},
    isActiveMember: false,
    isActiveUser: false,
    ...overrides,
  };
}

describe('nlContactToMCMember', () => {
  describe('interests', () => {
    it('should not include interests when groups is not set', () => {
      const member = nlContactToMCMember(createUpdate());

      expect(member.interests).toBeUndefined();
    });

    it('should set only the listed group to true when change is add', () => {
      const member = nlContactToMCMember(
        createUpdate({ groups: ['groupA'], newsletterGroupChange: 'add' })
      );

      expect(member.interests).toEqual({ groupA: true });
    });

    it('should set only the listed group to false when change is remove', () => {
      const member = nlContactToMCMember(
        createUpdate({ groups: ['groupA'], newsletterGroupChange: 'remove' })
      );

      expect(member.interests).toEqual({ groupA: false });
    });

    it('should not mention groups outside the list when removing', () => {
      const member = nlContactToMCMember(
        createUpdate({ groups: ['groupA'], newsletterGroupChange: 'remove' })
      );

      // groupB isn't in the payload at all, so Mailchimp leaves it untouched
      // rather than treating its absence as "unsubscribe from this too"
      expect(member.interests).not.toHaveProperty('groupB');
    });

    it('should declare every known group when replacing (the default)', () => {
      vi.spyOn(OptionsService, 'getJSON').mockReturnValue([
        { id: 'groupA', label: 'A' },
        { id: 'groupB', label: 'B' },
        { id: 'groupC', label: 'C' },
      ]);

      const member = nlContactToMCMember(createUpdate({ groups: ['groupB'] }));

      expect(member.interests).toEqual({
        groupA: false,
        groupB: true,
        groupC: false,
      });
    });
  });
});
