import { runApp } from '@beabee/core/server';
import { emailService } from '@beabee/core/services/EmailService';
import { EmailTemplateId } from '@beabee/core/type';

import type { DeleteEmailOverrideArgs } from '../../types/email.js';

export const deleteEmailOverride = async (
  argv: DeleteEmailOverrideArgs
): Promise<void> => {
  await runApp(async () => {
    // Validate that the template exists (unless force is specified)
    if (!argv.force && !emailService.isTemplateId(argv.template)) {
      throw new Error(`Unknown email template: ${argv.template}`);
    }

    // Delete the template override
    const deleted = await emailService.deleteTemplateOverride(
      argv.template as EmailTemplateId
    );

    if (deleted) {
      console.log(`Email template override deleted successfully!`);
      console.log(`Template: ${argv.template}`);
    } else {
      console.log(`No override found for template: ${argv.template}`);
    }
  });
};
