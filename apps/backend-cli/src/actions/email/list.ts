import { runApp } from '@beabee/core/server';
import { optionsService } from '@beabee/core/services/OptionsService';

import type { ListEmailOverridesArgs } from '../../types/email.js';

export const listEmailOverrides = async (
  argv: ListEmailOverridesArgs
): Promise<void> => {
  await runApp(async () => {
    const emailTemplates = optionsService.getJSON('email-templates') || {};

    if (Object.keys(emailTemplates).length === 0) {
      console.log('No email template overrides found.');
      return;
    }

    if (argv.template) {
      // Show specific template override
      if (emailTemplates[argv.template]) {
        console.log(`Template: ${argv.template}`);
        console.log(`Override ID: ${emailTemplates[argv.template]}`);
        console.log('');
      } else {
        console.log(`No override found for template: ${argv.template}`);
      }
    } else {
      // Show all template overrides
      console.log('Email Template Overrides:');
      console.log('');

      for (const [templateId, emailId] of Object.entries(emailTemplates)) {
        console.log(`Template: ${templateId}`);
        console.log(`Override ID: ${emailId}`);
        console.log('');
      }
    }
  });
};
