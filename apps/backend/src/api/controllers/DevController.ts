import { RoleType, RoleTypes } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { getRepository } from '@beabee/core/database';
import { Contact, ContactRole } from '@beabee/core/models';
import ContactsService from '@beabee/core/services/ContactsService';

import { login } from '@api/utils/auth';
import { isUUID } from 'class-validator';
import { Request, Response } from 'express';
import {
  Get,
  JsonController,
  NotFoundError,
  OnUndefined,
  Param,
  Post,
  Req,
  Res,
} from 'routing-controllers';

import { clearRateLimiterCache } from '../decorators/RateLimit';

/**
 * Development-only controller for testing and debugging purposes.
 * All endpoints are only available in dev mode.
 */
@JsonController('/dev')
export class DevController {
  /**
   * Clear the rate limiter cache.
   * Only available in development mode.
   */
  @Post('/clear-rate-limiter-cache')
  async clearRateLimiterCache(): Promise<{ message: string }> {
    // IMPORTANT: This is only available in dev mode
    if (!config.dev) {
      throw new NotFoundError();
    }

    clearRateLimiterCache();
    return { message: 'Rate limiter cache cleared successfully' };
  }

  /**
   * Login as a specific user or role for development purposes.
   * Only available in development mode.
   *
   * Usage:
   * - Login as role: /dev/login/as/superadmin
   * - Login as user: /dev/login/as/{uuid}
   */
  @Get('/login/as/:id')
  async loginAs(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string
  ): Promise<void> {
    // IMPORTANT: This is only available in dev mode
    if (!config.dev) {
      throw new NotFoundError();
    }

    let contact: Contact | undefined;
    if (RoleTypes.indexOf(id as RoleType) > -1) {
      const role = await getRepository(ContactRole).findOne({
        where: { type: id as RoleType },
        relations: { contact: true },
      });
      contact = role?.contact;
    } else if (isUUID(id, '4')) {
      contact = await ContactsService.findOneBy({ id });
    }

    if (contact) {
      await login(req, contact);
      // Redirect to home page after successful login (like legacy implementation)
      res.redirect(`${config.audience}/`);
    } else {
      // Redirect to login page if contact not found (like legacy implementation)
      res.redirect(`${config.audience}/login`);
    }
  }
}
