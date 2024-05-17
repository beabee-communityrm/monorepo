# beabee frontend

## Development setup

> ⚠️⚠️⚠️ **WARNING** ⚠️⚠️⚠️
>
> If you want to deploy beabee on a server refer to
> [beabee/beabee-deploy](https://github.com/beabee-communityrm/beabee-deploy/)
> instead. The instructions below are for running beabee locally for development

To set up:

```sh
cp .env.example .env
npm install
```

By default your frontend will use the API at https://dev.beabee.io. You can change this by editing the `.env` file

To start development:

```sh
npm start
```

To build the project:

```sh
npm run build
```

## Testing with BrowserStack

This project is tested with BrowserStack. As an open-source project, we have the privilege of using BrowserStack services for free, in exchange for acknowledging their support in our repository. BrowserStack is a comprehensive cloud web and mobile testing platform, enabling developers to test their websites and mobile applications across various browsers, operating systems, and real mobile devices.

## Internationalisation

Our locale data is stored in [this Google Sheet](https://docs.google.com/spreadsheets/d/1l35DW5OMi-xM8HXek5Q1jOxsXScINqqpEvPWDlpBPX8/edit#gid=0.). We use the Google Sheets APIs to pull this directly into the repository. You should ask another developers for their `.credentials.json` file so you can use the process below.

### Updating locale files

To update the locale data in the repository you run the following

```
node scripts/i18n.cjs
git add -A locales/ && git commit locales/ -m 'chore: updated locales'
```

### Using the localisation strings

In Vue files:

```vue
<template>
  <p>{{ t('hello') }}</p>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
```
