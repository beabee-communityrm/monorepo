import { getRepository } from '@beabee/core/database';
import { Email } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { emailService } from '@beabee/core/services/EmailService';
import { emailTemplateService } from '@beabee/core/services/EmailTemplateService';
import type { EmailTemplateId } from '@beabee/core/type';

import type { CreateEmailOverrideArgs } from '../../types/email.js';

export const createEmailOverride = async (
  argv: CreateEmailOverrideArgs
): Promise<void> => {
  await runApp(async () => {
    // Validate that the template exists (unless force is specified)
    if (!argv.force && !emailTemplateService.isTemplate(argv.template)) {
      throw new Error(`Unknown email template: ${argv.template}`);
    }

    // Create the email object
    const email = new Email();
    email.name = `Email for ${argv.template}`;
    email.subject = argv.subject;
    email.body = argv.body;
    email.fromName = argv.fromName || null;
    email.fromEmail = argv.fromEmail || null;

    // Save the email
    const savedEmail = await getRepository('Email').save(email);

    // Set it as the template override
    await emailService.setTemplateEmail(
      argv.template as EmailTemplateId,
      savedEmail
    );

    console.log(`Email template override created successfully!`);
    console.log(`Template: ${argv.template}`);
    console.log(`Email ID: ${savedEmail.id}`);
  });
};
