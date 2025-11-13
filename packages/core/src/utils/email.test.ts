import { describe, expect, it } from 'vitest';

import {
  expandNestedMergeFields,
  normalizeEmailAddress,
  replaceMergeFields,
} from './email';

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

describe('expandNestedMergeFields', () => {
  it('should expand nested merge fields in field values', () => {
    const mergeFields = {
      FNAME: 'John',
      MESSAGE: 'Hello *|FNAME|*, welcome to our platform!',
    };
    const result = expandNestedMergeFields(mergeFields);
    expect(result.MESSAGE).toBe('Hello John, welcome to our platform!');
  });

  it('should handle multiple levels of nesting', () => {
    const mergeFields = {
      FNAME: 'John',
      LNAME: 'Doe',
      FULLNAME: '*|FNAME|* *|LNAME|*',
      GREETING: 'Hello *|FULLNAME|*, welcome!',
    };
    const result = expandNestedMergeFields(mergeFields);
    expect(result.GREETING).toBe('Hello John Doe, welcome!');
  });

  it('should handle circular references safely', () => {
    const mergeFields = {
      FIELD1: '*|FIELD2|*',
      FIELD2: '*|FIELD1|*',
    };
    const result = expandNestedMergeFields(mergeFields);
    expect(result.FIELD1).toBe('*|FIELD2|*');
    expect(result.FIELD2).toBe('*|FIELD1|*');
  });

  it('should handle complex email template scenario', () => {
    const mergeFields = {
      FNAME: 'John',
      RPLINK: 'https://example.com/reset',
      MESSAGE: 'Hello *|FNAME|*, click *|RPLINK|* to reset your device.',
      SUBJECT: 'Reset for *|FNAME|*',
    };
    const result = expandNestedMergeFields(mergeFields);
    expect(result.MESSAGE).toBe(
      'Hello John, click https://example.com/reset to reset your device.'
    );
    expect(result.SUBJECT).toBe('Reset for John');
  });

  it('should return unchanged fields if no nesting exists', () => {
    const mergeFields = {
      FNAME: 'John',
      EMAIL: 'john@example.com',
    };
    const result = expandNestedMergeFields(mergeFields);
    expect(result).toEqual(mergeFields);
  });

  it('should handle empty merge fields object', () => {
    const result = expandNestedMergeFields({});
    expect(result).toEqual({});
  });
});
