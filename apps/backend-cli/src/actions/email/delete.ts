import { runApp } from '@beabee/core/server';
import { emailService } from '@beabee/core/services/EmailService';
import { emailTemplateService } from '@beabee/core/services/EmailTemplateService';
import { optionsService } from '@beabee/core/services/OptionsService';
import type { EmailTemplateId } from '@beabee/core/type';

import type { DeleteEmailOverrideArgs } from '../../types/email.js';

export const deleteEmailOverride = async (
  argv: DeleteEmailOverrideArgs
): Promise<void> => {
  await runApp(async () => {
    // Validate that the template exists (unless force is specified)
    if (!argv.force && !emailTemplateService.isTemplate(argv.template)) {
      throw new Error(`Unknown email template: ${argv.template}`);
    }

    // Check if template override exists
    const emailTemplates = optionsService.getJSON('email-templates') || {};
    if (!emailTemplates[argv.template]) {
      console.log(`No override found for template: ${argv.template}`);
      return;
    }

    // Delete the template override
    await emailService.deleteTemplateEmail(argv.template as EmailTemplateId);

    console.log(`Email template override deleted successfully!`);
    console.log(`Template: ${argv.template}`);
  });
};
