# NoticeForm

The `NoticeForm` component provides a comprehensive form interface for creating and editing system notices. It supports both new notice creation and editing existing notices with pre-filled data.

## Purpose

This component is used for **administrative notice management** in admin panels where users need to:

- ✅ **Create new notices** with scheduling and expiration dates
- ✅ **Edit existing notices** with pre-populated form data
- ✅ **Localize form labels** through props to support multiple languages
- ✅ **Validate required fields** and conditional validation (URL required when button text is provided)
- ✅ **Convert form data** to API-compatible format with proper date handling

## Key Features

- **Flexible label system**: All form labels are passed as props, allowing complete localization
- **Date/time separation**: Handles start and expiration dates with separate date and time inputs
- **Conditional validation**: URL field becomes required when button text is provided
- **Pre-filling support**: Can be initialized with existing notice data for editing scenarios
- **Type-safe events**: Emits strongly-typed events with converted data ready for API submission
