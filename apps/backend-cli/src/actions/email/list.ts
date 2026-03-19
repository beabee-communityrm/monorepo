import { getRepository } from '@beabee/core/database';
import { Email } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';

import { IsNull, Not } from 'typeorm';

import type { ListEmailOverridesArgs } from '../../types/email.js';

export const listEmailOverrides = async (
  argv: ListEmailOverridesArgs
): Promise<void> => {
  await runApp(async () => {
    const overrides = await getRepository(Email).find({
      where: { templateId: argv.template || Not(IsNull()) },
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
  });
};
