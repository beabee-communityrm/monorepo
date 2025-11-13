# AppMergeFields

Display available merge fields for email templates in a grouped, collapsible format. Merge fields are placeholders (format: `*|FIELD_NAME|*`) that get replaced with dynamic values at runtime.

## Purpose

This component provides a user-friendly interface for viewing and using merge fields in email templates. It supports:

- ✅ **Grouped display** with clear category separation
- ✅ **Collapse/expand all** functionality for space management
- ✅ **Copy to clipboard** for manual insertion
- ✅ **Insert action** for rich text editor integration
- ✅ **Multi-language support** with dynamic i18n keys
- ✅ **Example values** for better understanding

## Common Use Cases

### Email Template Editor

Display merge fields as a sidebar next to the email content editor, allowing users to insert personalization tokens.

### Documentation Reference

Show available merge fields for a specific email template to help users understand what dynamic content is available.

### Rich Text Editor Integration

Connect with `AppRichTextEditor` to enable one-click insertion of merge fields at cursor position.
