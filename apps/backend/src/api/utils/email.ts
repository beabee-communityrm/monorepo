import { getRepository } from '@beabee/core/database';
import { ExternalEmailTemplate } from '@beabee/core/errors';
import { Email } from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';

import { isUUID } from 'class-validator';

export async function findEmail(id: string): Promise<Email | null> {
  if (isUUID(id, '4')) {
    return await getRepository(Email).findOneBy({ id });
  } else if (EmailService.isTemplateId(id)) {
    const maybeEmail = await EmailService.getTemplateEmail(id);
    if (maybeEmail) {
      return maybeEmail;
    } else if (maybeEmail === false) {
      throw new ExternalEmailTemplate();
    }
  }
  return null;
}
