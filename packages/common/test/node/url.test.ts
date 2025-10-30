import { isAbsoluteUrl, isURL } from '@beabee/beabee-common';

import { describe, expect, test } from 'vitest';

describe('isURL', () => {
  test('valid URL', () => {
    expect(isURL('https://beabee.io/')).toBe(true);
  });

  test('valid URL with www', () => {
    expect(isURL('https://www.beabee.io/')).toBe(true);
  });

  test('valid URL with path', () => {
    expect(isURL('https://beabee.io/path/to/resource')).toBe(true);
  });

  test('valid URL with query parameters', () => {
    expect(isURL('https://beabee.io/path?param1=value1&param2=value2')).toBe(
      true
    );
  });

  test('valid URL with port', () => {
    expect(isURL('https://beabee.io:8080')).toBe(true);
  });

  test('invalid URL missing protocol', () => {
    expect(isURL('beabee.io')).toBe(false);
  });

  test('invalid URL missing domain', () => {
    expect(isURL('https://')).toBe(false);
  });

  test('invalid URL with spaces', () => {
    expect(isURL('https://bea bee.io')).toBe(false);
  });

  test('invalid URL with multiple periods', () => {
    expect(isURL('https://beabee..io')).toBe(false);
  });
});

describe('isAbsoluteUrl', () => {
  test('valid localhost URL', () => {
    expect(
      isAbsoluteUrl(
        'http://localhost:3002/api/1.0/images/606b5b37-76f2-4796-9531-2ab832ba6a05.avif'
      )
    ).toBe(true);
  });

  test('valid localhost URL with different port', () => {
    expect(isAbsoluteUrl('http://localhost:8080/path/to/file.jpg')).toBe(true);
  });

  test('valid https URL', () => {
    expect(isAbsoluteUrl('https://example.com/image.png')).toBe(true);
  });

  test('valid http URL', () => {
    expect(isAbsoluteUrl('http://example.com/image.png')).toBe(true);
  });

  test('invalid relative URL', () => {
    expect(isAbsoluteUrl('/path/to/image.png')).toBe(false);
  });

  test('invalid URL without protocol', () => {
    expect(isAbsoluteUrl('example.com/image.png')).toBe(false);
  });

  test('invalid ftp URL', () => {
    expect(isAbsoluteUrl('ftp://example.com/file.txt')).toBe(false);
  });

  test('valid blob URL', () => {
    expect(isAbsoluteUrl('blob:http://localhost:3000/12345-67890')).toBe(true);
  });
});
