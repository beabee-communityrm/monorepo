import type { ArgumentsCamelCase, CommandModule } from 'yargs';

import {
  checkTranslationKey,
  getAvailableLocales,
  getTranslations,
  listTranslationKeys,
  validateTranslationUsage,
} from '../actions/index.ts';
import type { ListTranslationKeysOptions } from '../types/index.ts';

/**
 * Check translation key command
 */
const checkKeyCommand: CommandModule = {
  command: 'check-key <key>',
  describe: 'Check if a translation key exists and get information about it',
  builder: (yargs) => {
    return yargs
      .positional('key', {
        describe: 'Translation key to check (e.g., "actions.save")',
        type: 'string',
        demandOption: true,
      })
      .option('format', {
        alias: 'f',
        type: 'string',
        choices: ['json', 'table'],
        default: 'table',
        describe: 'Output format',
      })
      .example(
        'yarn dev-cli translation check-key actions.save',
        'Check if "actions.save" key exists'
      )
      .example(
        'yarn dev-cli translation check-key common.loading --format json',
        'Output in JSON format'
      );
  },
  handler: async (
    argv: ArgumentsCamelCase<{ key: string; format: 'json' | 'table' }>
  ) => {
    try {
      const result = await checkTranslationKey(argv.key);

      if (argv.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n🔍 Translation Key: "${argv.key}"`);
        console.log(`✅ Exists: ${result.exists ? 'Yes' : 'No'}`);
        console.log(
          `📊 Available in ${result.availableLocales.length}/${result.totalLocales} locales`
        );

        if (result.availableLocales.length > 0) {
          console.log(
            `\n✅ Available in: ${result.availableLocales.join(', ')}`
          );
        }

        if (result.missingLocales.length > 0) {
          console.log(`\n❌ Missing in: ${result.missingLocales.join(', ')}`);
        }

        if (Object.keys(result.translations).length > 0) {
          console.log('\n📝 Translations:');
          Object.entries(result.translations).forEach(
            ([locale, translation]) => {
              console.log(`  ${locale}: "${translation}"`);
            }
          );
        }
      }
    } catch (error) {
      console.error('❌ Error checking translation key:', error);
      process.exit(1);
    }
  },
};

/**
 * Get translations command
 */
const getTranslationsCommand: CommandModule = {
  command: 'get <key>',
  describe: 'Get translation values for a key across all locales',
  builder: (yargs) => {
    return yargs
      .positional('key', {
        describe: 'Translation key to get translations for',
        type: 'string',
        demandOption: true,
      })
      .option('format', {
        alias: 'f',
        type: 'string',
        choices: ['json', 'table'],
        default: 'table',
        describe: 'Output format',
      })
      .example(
        'yarn dev-cli translation get actions.save',
        'Get all translations for "actions.save"'
      );
  },
  handler: async (
    argv: ArgumentsCamelCase<{ key: string; format: 'json' | 'table' }>
  ) => {
    try {
      const translations = await getTranslations(argv.key);

      if (argv.format === 'json') {
        console.log(JSON.stringify(translations, null, 2));
      } else {
        console.log(`\n📝 Translations for: "${argv.key}"\n`);

        Object.entries(translations).forEach(([locale, translation]) => {
          if (translation !== undefined) {
            console.log(`  ${locale.padEnd(12)}: "${translation}"`);
          } else {
            console.log(`  ${locale.padEnd(12)}: ❌ Missing`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error getting translations:', error);
      process.exit(1);
    }
  },
};

/**
 * List translation keys command
 */
const listKeysCommand: CommandModule = {
  command: 'list',
  describe: 'List available translation keys',
  builder: (yargs) => {
    return yargs
      .option('prefix', {
        alias: 'p',
        type: 'string',
        describe: 'Filter keys by prefix',
      })
      .option('limit', {
        alias: 'l',
        type: 'number',
        describe: 'Maximum number of keys to return',
        default: 50,
      })
      .option('format', {
        alias: 'f',
        type: 'string',
        choices: ['json', 'list'],
        default: 'list',
        describe: 'Output format',
      })
      .example(
        'yarn dev-cli translation list',
        'List first 50 translation keys'
      )
      .example(
        'yarn dev-cli translation list --prefix actions',
        'List keys starting with "actions"'
      )
      .example(
        'yarn dev-cli translation list --limit 100',
        'List first 100 keys'
      );
  },
  handler: async (
    argv: ArgumentsCamelCase<{
      prefix?: string;
      limit: number;
      format: 'json' | 'list';
    }>
  ) => {
    try {
      const options: ListTranslationKeysOptions = {
        prefix: argv.prefix,
        limit: argv.limit,
      };

      const result = await listTranslationKeys(options);

      if (argv.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const prefix = argv.prefix ? ` with prefix "${argv.prefix}"` : '';
        console.log(
          `\n📋 Found ${result.total} translation keys${prefix}${result.truncated ? ` (showing first ${argv.limit})` : ''}:\n`
        );

        result.keys.forEach((key, index) => {
          console.log(`  ${(index + 1).toString().padStart(3)}: ${key}`);
        });

        if (result.truncated) {
          console.log(`\n... and ${result.total - argv.limit} more keys`);
        }
      }
    } catch (error) {
      console.error('❌ Error listing translation keys:', error);
      process.exit(1);
    }
  },
};

/**
 * Validate translation usage command
 */
const validateCommand: CommandModule = {
  command: 'validate <key>',
  describe: 'Validate translation key format and existence',
  builder: (yargs) => {
    return yargs
      .positional('key', {
        describe: 'Translation key to validate',
        type: 'string',
        demandOption: true,
      })
      .option('format', {
        alias: 'f',
        type: 'string',
        choices: ['json', 'detailed'],
        default: 'detailed',
        describe: 'Output format',
      })
      .example(
        'yarn dev-cli translation validate actions.save',
        'Validate "actions.save" key'
      )
      .example(
        'yarn dev-cli translation validate invalid..key',
        'Validate invalid key and get suggestions'
      );
  },
  handler: async (
    argv: ArgumentsCamelCase<{ key: string; format: 'json' | 'detailed' }>
  ) => {
    try {
      const result = await validateTranslationUsage(argv.key);

      if (argv.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`\n🔍 Validating: "${argv.key}"`);
        console.log(
          `\n${result.valid ? '✅' : '❌'} Status: ${result.valid ? 'Valid' : 'Invalid'}`
        );

        if (result.errors.length > 0) {
          console.log('\n❌ Errors:');
          result.errors.forEach((error) => {
            console.log(`  • ${error}`);
          });
        }

        if (result.suggestions.length > 0) {
          console.log('\n💡 Suggestions:');
          result.suggestions.forEach((suggestion) => {
            console.log(`  • ${suggestion}`);
          });
        }
      }

      // Exit with error code if validation failed
      if (!result.valid) {
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error validating translation key:', error);
      process.exit(1);
    }
  },
};

/**
 * List locales command
 */
const listLocalesCommand: CommandModule = {
  command: 'locales',
  describe: 'List all available locales',
  builder: (yargs) => {
    return yargs
      .option('format', {
        alias: 'f',
        type: 'string',
        choices: ['json', 'list'],
        default: 'list',
        describe: 'Output format',
      })
      .example('yarn dev-cli translation locales', 'List available locales');
  },
  handler: async (argv: ArgumentsCamelCase<{ format: 'json' | 'list' }>) => {
    try {
      const locales = getAvailableLocales();

      if (argv.format === 'json') {
        console.log(JSON.stringify(locales, null, 2));
      } else {
        console.log(`\n🌐 Available locales (${locales.length}):\n`);
        locales.forEach((locale, index) => {
          console.log(`  ${(index + 1).toString().padStart(2)}: ${locale}`);
        });
      }
    } catch (error) {
      console.error('❌ Error listing locales:', error);
      process.exit(1);
    }
  },
};

/**
 * Main translation command with subcommands
 */
export const translationCommand: CommandModule = {
  command: 'translation',
  describe: 'Translation key validation and management tools',
  builder: (yargs) => {
    return yargs
      .command(checkKeyCommand)
      .command(getTranslationsCommand)
      .command(listKeysCommand)
      .command(validateCommand)
      .command(listLocalesCommand)
      .demandCommand(1, 'You need to specify a subcommand')
      .help();
  },
  handler: () => {
    // This handler is not used since we have subcommands
  },
};
