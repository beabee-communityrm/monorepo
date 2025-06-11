# AppInputHelp

The `AppInputHelp` component displays helpful information and guidance for form inputs. It provides users with context, instructions, or additional information about what to enter in form fields.

## Features

- Clean, informative styling with info icon
- Uses FontAwesome info circle icon for visual clarity
- Consistent text styling with body-80 color
- Small, semi-bold text that doesn't overwhelm the form
- Proper spacing for positioning below form inputs

## Usage

```vue
<AppInputHelp message="This is a helpful message to guide the user" />
```

## Props

| Prop      | Type     | Default | Description                 |
| --------- | -------- | ------- | --------------------------- |
| `message` | `string` | -       | The help message to display |

## Examples

### Basic Usage

```vue
<AppInputHelp message="Enter your full legal name as it appears on your ID" />
```

### With Form Input

```vue
<AppInput v-model="password" type="password" label="Password" />
<AppInputHelp
  message="Password must be at least 8 characters long and include uppercase, lowercase, and numbers"
/>
```

### Common Help Messages

```vue
<!-- Password requirements -->
<AppInputHelp
  message="Password must be at least 8 characters long and include uppercase, lowercase, and numbers"
/>

<!-- Email guidance -->
<AppInputHelp
  message="We'll use this email to send you important updates about your membership"
/>

<!-- Optional field guidance -->
<AppInputHelp
  message="This field is optional but helps us provide better service"
/>

<!-- Format instructions -->
<AppInputHelp
  message="Please enter your phone number in the format: +1 (555) 123-4567"
/>

<!-- Length guidance -->
<AppInputHelp message="Keep your bio under 200 characters for best display" />
```

## Real-world Examples

The AppInputHelp is commonly used to provide context and guidance:

1. **Password Requirements**

```vue
<AppInput v-model="password" type="password" label="Password" required />
<AppInputHelp
  message="Must contain at least 8 characters with uppercase, lowercase, numbers, and special characters"
/>
```

2. **Email with Purpose**

```vue
<AppInput v-model="email" type="email" label="Email Address" required />
<AppInputHelp
  message="We'll use this email for account notifications and important updates"
/>
```

3. **Optional Fields**

```vue
<AppInput v-model="bio" type="text" label="Bio" />
<AppInputHelp
  message="Optional: Tell us a bit about yourself (max 200 characters)"
/>
```

4. **Format Instructions**

```vue
<AppInput v-model="phone" type="text" label="Phone Number" />
<AppInputHelp
  message="Format: +1 (555) 123-4567 or include your country code"
/>
```

5. **Data Usage Information**

```vue
<AppInput v-model="location" type="text" label="Location" />
<AppInputHelp
  message="We use this to show you relevant local content and events"
/>
```

## How It Works

The AppInputHelp component:

1. Displays an info circle icon using FontAwesome for visual consistency
2. Shows help text in a muted color (body-80) that doesn't compete with the main content
3. Uses small font size (text-xs) and semi-bold weight for readability
4. Provides proper spacing (mt-2) to position below form elements
5. Uses flexbox layout to align the icon and text properly

This creates a consistent way to provide helpful guidance and context for form fields throughout the application.
