import { escapeHtml } from '@beabee/beabee-common';

import { describe, expect, test } from 'vitest';

describe('escapeHtml', () => {
  test('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  test('escapes ampersand', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  test('escapes less than', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  test('escapes greater than', () => {
    expect(escapeHtml('</div>')).toBe('&lt;/div&gt;');
  });

  test('escapes double quotes', () => {
    expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;');
  });

  test('escapes single quotes', () => {
    expect(escapeHtml("It's working")).toBe('It&#039;s working');
  });

  test('escapes all special characters', () => {
    expect(escapeHtml('<a href="/" title="Home">Home</a>')).toBe(
      '&lt;a href=&quot;/&quot; title=&quot;Home&quot;&gt;Home&lt;/a&gt;'
    );
  });

  test('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  test('handles string without special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  test('handles string with only special characters', () => {
    expect(escapeHtml('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&#039;');
  });
});
