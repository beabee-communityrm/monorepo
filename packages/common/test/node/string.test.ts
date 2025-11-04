import { describe, expect, it } from 'vitest';

import { escapeHtml } from '../../src/utils/string.js';

describe('escapeHtml', () => {
  it('escapes ampersand', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes less than', () => {
    expect(escapeHtml('5 < 10')).toBe('5 &lt; 10');
  });

  it('escapes greater than', () => {
    expect(escapeHtml('10 > 5')).toBe('10 &gt; 5');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('He said "Hello"')).toBe('He said &quot;Hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("It's working")).toBe('It&#039;s working');
  });

  it('escapes multiple special characters', () => {
    expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
      '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
    );
  });

  it('escapes all special characters together', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#039;');
  });

  it('handles text without special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('handles mixed text with special characters', () => {
    expect(escapeHtml('Price: 5€ & "free" shipping')).toBe(
      'Price: 5€ &amp; &quot;free&quot; shipping'
    );
  });

  it('prevents XSS attacks', () => {
    const maliciousInput = '<img src=x onerror="alert(\'XSS\')">';
    const escaped = escapeHtml(maliciousInput);
    expect(escaped).toBe(
      '&lt;img src=x onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;'
    );
    expect(escaped).not.toContain('<');
    expect(escaped).not.toContain('>');
  });
});
