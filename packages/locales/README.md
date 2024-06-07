# Beabee Locales

## Overview

This package contains all the localization files (locales) used across both the
backend and frontend of our application. It is designed to centralize the
management of language resources, ensuring consistency and ease of updates
across the entire monorepo.

## Structure

The locales are stored in JSON and TypeScript format, allowing easy integration
with various parts of our application. The structure is designed to be
straightforward, with a clear separation between different languages and their
respective formats.

## Usage

```
yarn add @beabee/locales
```

```ts
import en from "@beabee/locales/en.json";
import { en, pl } from "@beabee/locales";
```

## Key Yarn Scripts

### `yarn build`

This script compiles the source files from the `src` directory into a
distributable format located in the `dist` directory.

### `yarn update:locales`

This script updates the locale files from a Google Spreadsheet.

- **`yarn update:locales:json`**: This updates the JSON files with new
  translations or modifications.
- **`yarn update:locales:ts`**: Similar to the JSON update, this script updates
  TypeScript files with new or modified translations.
