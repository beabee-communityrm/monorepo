# AppRadioInput

The `AppRadioInput` component provides a single radio button with custom styling and variant support for exclusive choice selections.

## Usage Patterns

- **Single options** - Individual radio button within custom layouts
- **Configuration choices** - Settings with exclusive selection requirements
- **Survey responses** - Single-answer questions with custom positioning
- **Custom radio groups** - Building custom radio group layouts

## Key Features

- ✅ **Variant support** - Primary, link, and danger color schemes
- ✅ **Custom styling** - Consistent visual design matching other inputs
- ✅ **Validation integration** - Works with form validation frameworks
- ✅ **Label support** - Built-in label with proper accessibility attributes

## Usage

```vue
<AppRadioInput
  v-model="selection"
  name="radio-option"
  value="option1"
  variant="primary"
>
  Radio option label
</AppRadioInput>
```
