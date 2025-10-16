import { getRepository } from '@beabee/core/database';
import { Email } from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import { AuthInfo } from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import { GetEmailDto, UpdateEmailDto } from '@api/dto/EmailDto';
import EmailTransformer from '@api/transformers/EmailTransformer';
import { findEmail } from '@api/utils/email';
import {
  Authorized,
  Body,
  Get,
  JsonController,
  Param,
  Put,
} from 'routing-controllers';

@Authorized('admin')
@JsonController('/email')
export class EmailController {
  @Get('/:id')
  async getEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: string
  ): Promise<GetEmailDto | undefined> {
    const email = await findEmail(id);
    return email ? EmailTransformer.convert(email, auth) : undefined;
  }

  @Put('/:id')
  async updateEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: string,
    @Body() data: UpdateEmailDto
  ): Promise<GetEmailDto | undefined> {
    const email = await findEmail(id);
    if (email) {
      await getRepository(Email).update(email.id, data);
      return data;
    } else if (EmailService.isTemplateId(id)) {
      const email = await getRepository(Email).save({
        name: 'Email for ' + id,
        ...data,
      });
      await EmailService.setTemplateEmail(id, email);
      return EmailTransformer.convert(email, auth);
    }
  }
}
