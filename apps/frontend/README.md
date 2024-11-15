# beabee frontend

## Development setup

To set up:

```sh
cp .env.example .env
yarn install
```

By default your frontend will use the API at https://dev.beabee.io. You can change this by editing the `.env` file

To start development:

```sh
yarn dev
```

To build the project:

```sh
yarn build
```

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
