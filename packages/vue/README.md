# @beabee/vue

This package contains shared Vue components, theme functionality, and styling for the Beabee platform. It serves as a component library that can be used across different parts of the application.

## Features

- Reusable UI components
- Theme system with customizable colors
- Histoire integration for component documentation and development
- Tailwind CSS configuration
- Font assets and styling

## Development

### Setup

~~~sh
# From the root of the repository
yarn workspace @beabee/vue install
~~~

### Running Histoire

[Histoire](https://histoire.dev/) is used for component development and documentation. To start the Histoire development server:

~~~sh
yarn workspace @beabee/vue dev
~~~

This will launch Histoire at http://localhost:6006 by default, where you can browse and interact with the components.

### Building

To build the Histoire documentation site:

~~~sh
yarn workspace @beabee/vue build
~~~

### Previewing the built documentation

~~~sh
yarn workspace @beabee/vue start
~~~

## Usage

### Importing Components

Components can be imported directly from the package:

~~~ts
import { AppButton } from '@beabee/vue/components';
~~~

### Theme System

The theme system can be imported and used as follows:

~~~ts
import { useTheme } from '@beabee/vue/lib/theme';

const { currentTheme, setTheme } = useTheme();
~~~

### Styles

To import the base styles:

~~~ts
import '@beabee/vue/styles';
~~~

## Component Documentation

Each component should have a corresponding `.story.vue` file that demonstrates its usage and variants. For example:

~~~vue
<template>
  <Story title="Buttons/AppButton">
    <Variant title="Primary">
      <AppButton>Primary Button</AppButton>
    </Variant>
    <!-- More variants -->
  </Story>
</template>
~~~

## Adding New Components

When adding new components:

1. Create the component in `src/components/`
2. Add a story file for documentation
3. Export the component in the appropriate index file
4. Ensure it works with the theme system if applicable

## Tailwind Configuration

The package includes its own Tailwind configuration that can be extended or used by other packages:

~~~js
// In your tailwind.config.js
import { tailwindConfig } from '@beabee/vue/tailwind.config';

export default {
  presets: [tailwindConfig],
  // Your additional configuration
};
~~~ 
