import { runApp } from '@beabee/core/server';
import { emailService } from '@beabee/core/services/EmailService';
import type { EmailTemplateId } from '@beabee/core/type';

import type { CreateEmailOverrideArgs } from '../../types/email.js';

export const createEmailOverride = async (
  argv: CreateEmailOverrideArgs
): Promise<void> => {
  await runApp(async () => {
    // Validate that the template exists (unless force is specified)
    if (!argv.force && !emailService.isTemplateId(argv.template)) {
      throw new Error(`Unknown email template: ${argv.template}`);
    }

    // Create or update the template override
    const savedEmail = await emailService.createOrUpdateTemplateOverride(
      argv.template as EmailTemplateId,
      {
        ...argv,
        fromName: argv.fromName ?? null,
        fromEmail: argv.fromEmail ?? null,
      }
    );

    console.log(`Email template override created successfully!`);
    console.log(`Template: ${argv.template}`);
    console.log(`Email ID: ${savedEmail.id}`);
  });
};
