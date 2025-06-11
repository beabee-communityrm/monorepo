import { runApp } from '@beabee/core/server';
import { optionsService } from '@beabee/core/services/OptionsService';
import { input } from '@inquirer/prompts';
import type { SetupSupportEmailArgs } from '../../types/setup.js';

/**
 * Set up the support email based on the provided email domain
 * Accepts command line arguments or prompts for missing information
 */
export const setupSupportEmail = async (
  args: SetupSupportEmailArgs = {}
): Promise<void> => {
  try {
    console.log('Setting up support email configuration...\n');

    // Get email domain from arguments or prompt for it
    const emailDomain =
      args.emailDomain ||
      (await input({
        message: 'Enter email domain for support email:',
        validate: (input: string) => {
          if (input.trim() === '') {
            return 'Email domain is required';
          }
          // Basic domain validation
          const domainRegex =
            /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})+$/;
          if (!domainRegex.test(input)) {
            return 'Please enter a valid domain (e.g., example.com)';
          }
          return true;
        },
      }));

    await runApp(async () => {
      const supportEmail = `support@${emailDomain}`;

      // Set support email based on email domain
      await optionsService.set('support-email', supportEmail);

      console.log('Support email configuration updated successfully!');
      console.log(`Support email set to: ${supportEmail}`);
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ExitPromptError'
    ) {
      console.log('\nOperation cancelled by user.');
      return;
    }
    throw error;
  }
};
