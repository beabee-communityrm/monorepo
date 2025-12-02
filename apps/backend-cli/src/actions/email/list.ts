import { getRepository } from '@beabee/core/database';
import { Email } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';

import { IsNull, Not } from 'typeorm';

import type { ListEmailOverridesArgs } from '../../types/email.js';

export const listEmailOverrides = async (
  argv: ListEmailOverridesArgs
): Promise<void> => {
  await runApp(async () => {
    if (argv.template) {
      // Show specific template override
      const override = await getRepository(Email).findOneBy({
        templateId: argv.template,
      });
      if (override) {
        console.log(`Template: ${argv.template}`);
        console.log(`Override ID: ${override.id}`);
        console.log(`Subject: ${override.subject}`);
        console.log('');
      } else {
        console.log(`No override found for template: ${argv.template}`);
      }
    } else {
      // Show all template overrides
      const overrides = await getRepository(Email).find({
        where: { templateId: Not(IsNull()) },
      });

      if (overrides.length === 0) {
        console.log('No email template overrides found.');
        return;
      }

      console.log('Email Template Overrides:');
      console.log('');

      for (const override of overrides) {
        console.log(`Template: ${override.templateId}`);
        console.log(`Override ID: ${override.id}`);
        console.log(`Subject: ${override.subject}`);
        console.log('');
      }
    }
  });
};
