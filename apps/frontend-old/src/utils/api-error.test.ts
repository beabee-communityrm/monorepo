import { CantUpdateContributionError } from '@beabee/client';

import { describe, expect, it, vi } from 'vitest';

import { extractErrorText } from './api-error';

vi.mock('#lib/i18n', () => ({
  i18n: {
    global: {
      t: (key: string) => `translated:${key}`,
    },
  },
}));
vi.mock('@beabee/vue', () => ({
  formatDistanceLocale: () => '1 minute',
}));
vi.mock('@beabee/vue/store/notifications', () => ({
  addNotification: vi.fn(),
}));

describe('extractErrorText', () => {
  it('should return translated text for cant-update-contribution', () => {
    const error = new CantUpdateContributionError('Cannot update contribution');

    const result = extractErrorText(error);

    expect(result).toBe(
      'translated:form.errorMessages.api.cant-update-contribution'
    );
  });

  it('should fallback to generic text for unknown errors', () => {
    const result = extractErrorText(new Error('Unexpected'));

    expect(result).toBe('translated:form.errorMessages.generic');
  });
});
