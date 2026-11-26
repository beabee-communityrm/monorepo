import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
  { ignores: ['*.d.ts', '**/coverage', '**/dist', '**/vite.config.*'] },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      'vue/no-v-html': 'off',
      'no-console': 'warn',
      // The dev panel only reaches the app through its hooks
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@beabee/dev-panel',
              allowTypeImports: true,
              message: 'Only types can be imported from the dev panel.',
            },
          ],
          patterns: [
            {
              group: ['@beabee/dev-panel/*'],
              message: 'The dev panel is added by its Vite plugin.',
            },
          ],
        },
      ],
    },
  },
  {
    // Components read their queries through their page's file in
    // src/route-queries, which starts every query it lists
    files: ['src/components/**/*.vue'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['#queries/*'],
              message:
                "Import queries through your page's file in src/route-queries.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/pages/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  eslintConfigPrettier
);
