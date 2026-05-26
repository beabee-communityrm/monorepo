import { describe, expect, it } from 'vitest';

import { normalizeEmailAddress, replaceMergeFields } from './email';

describe('normalizeEmailAddress', () => {
  it('should trim whitespace from email', () => {
    expect(normalizeEmailAddress(' test@example.com ')).toBe(
      'test@example.com'
    );
  });

  it('should convert email to lowercase', () => {
    expect(normalizeEmailAddress('TEST@EXAMPLE.COM')).toBe('test@example.com');
  });

  it('should handle both trimming and lowercasing', () => {
    expect(normalizeEmailAddress('  TEST@EXAMPLE.COM  ')).toBe(
      'test@example.com'
    );
  });

  it('should return unchanged email if already normalized', () => {
    expect(normalizeEmailAddress('test@example.com')).toBe('test@example.com');
  });
});

describe('replaceMergeFields', () => {
  it('should replace single merge field', () => {
    const text = 'Hello *|FNAME|*, welcome!';
    const mergeFields = { FNAME: 'John' };
    expect(replaceMergeFields(text, mergeFields)).toBe('Hello John, welcome!');
  });

  it('should replace multiple merge fields', () => {
    const text = 'Hello *|FNAME|*, your email is *|EMAIL|*';
    const mergeFields = { FNAME: 'John', EMAIL: 'john@example.com' };
    expect(replaceMergeFields(text, mergeFields)).toBe(
      'Hello John, your email is john@example.com'
    );
  });

  it('should handle missing merge fields gracefully', () => {
    const text = 'Hello *|FNAME|*, welcome!';
    const mergeFields = {};
    expect(replaceMergeFields(text, mergeFields)).toBe(
      'Hello *|FNAME|*, welcome!'
    );
  });

  it('should replace merge fields with special characters in values', () => {
    const text = 'Hello *|FNAME|*!';
    const mergeFields = { FNAME: 'John & Jane' };
    expect(replaceMergeFields(text, mergeFields)).toBe('Hello John & Jane!');
  });
});
