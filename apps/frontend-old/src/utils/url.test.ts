import { describe, expect, it } from 'vitest';

import { isInternalUrl } from './url';

describe('isInternalUrl', () => {
  it('should return true for relative paths starting with a single slash', () => {
    expect(isInternalUrl('/')).toBe(true);
    expect(isInternalUrl('/home')).toBe(true);
    expect(isInternalUrl('/about')).toBe(true);
    expect(isInternalUrl('/users/123')).toBe(true);
    expect(isInternalUrl('/path/to/resource')).toBe(true);
    expect(isInternalUrl('/dashboard/settings')).toBe(true);
  });

  it('should return true for paths with query parameters', () => {
    expect(isInternalUrl('/search?q=test')).toBe(true);
    expect(isInternalUrl('/users?page=1&limit=10')).toBe(true);
  });

  it('should return true for paths with fragments', () => {
    expect(isInternalUrl('/page#section')).toBe(true);
    expect(isInternalUrl('/docs#introduction')).toBe(true);
  });

  it('should return true for paths with both query parameters and fragments', () => {
    expect(isInternalUrl('/search?q=test#results')).toBe(true);
    expect(isInternalUrl('/users?page=1#user-123')).toBe(true);
  });

  it('should return false for URLs starting with double slashes (protocol-relative)', () => {
    expect(isInternalUrl('//example.com')).toBe(false);
    expect(isInternalUrl('//www.google.com/search')).toBe(false);
    expect(isInternalUrl('//cdn.example.com/assets/image.png')).toBe(false);
  });

  it('should return false for absolute URLs with protocols', () => {
    expect(isInternalUrl('http://example.com')).toBe(false);
    expect(isInternalUrl('https://www.google.com')).toBe(false);
    expect(isInternalUrl('ftp://files.example.com')).toBe(false);
    expect(isInternalUrl('mailto:user@example.com')).toBe(false);
    expect(isInternalUrl('tel:+1234567890')).toBe(false);
  });

  it('should return false for relative paths without leading slash', () => {
    expect(isInternalUrl('home')).toBe(false);
    expect(isInternalUrl('about')).toBe(false);
    expect(isInternalUrl('users/123')).toBe(false);
    expect(isInternalUrl('path/to/resource')).toBe(false);
  });

  it('should return false for undefined input', () => {
    expect(isInternalUrl(undefined)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isInternalUrl('')).toBe(false);
  });

  it('should return false for whitespace-only strings', () => {
    expect(isInternalUrl(' ')).toBe(false);
    expect(isInternalUrl('\t')).toBe(false);
    expect(isInternalUrl('\n')).toBe(false);
  });

  it('should return false for strings starting with special characters', () => {
    expect(isInternalUrl('#section')).toBe(false);
    expect(isInternalUrl('?query=value')).toBe(false);
    expect(isInternalUrl('javascript:void(0)')).toBe(false);
  });

  it('should handle edge cases with encoded characters', () => {
    expect(isInternalUrl('/path%20with%20spaces')).toBe(true);
    expect(isInternalUrl('/users/%E2%9C%93')).toBe(true);
  });

  it('should handle paths with special characters', () => {
    expect(isInternalUrl('/path-with-dashes')).toBe(true);
    expect(isInternalUrl('/path_with_underscores')).toBe(true);
    expect(isInternalUrl('/path.with.dots')).toBe(true);
    expect(isInternalUrl('/path~with~tildes')).toBe(true);
  });
});
