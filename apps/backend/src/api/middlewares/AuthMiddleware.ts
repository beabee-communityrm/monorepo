import { ActivityActor, ActivityActorType } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { actorContext } from '@beabee/core/lib/actor-context';
import { ApiKey } from '@beabee/core/models';
import ContactsService from '@beabee/core/services/ContactsService';
import { AuthInfo } from '@beabee/core/type';
import { extractToken } from '@beabee/core/utils/auth';

import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

@Middleware({ type: 'before' })
export class AuthMiddleware implements ExpressMiddlewareInterface {
  async use(
    req: Request,
    res: Response,
    next: (err?: any) => any
  ): Promise<void> {
    req.auth = await getAuth(req);

    // Run all downstream operations with the ActivityActor in context
    actorContext.run(authInfoToActor(req.auth), next);
  }
}

async function getAuth(request: Request): Promise<AuthInfo> {
  const headers = request.headers;
  const authHeader = headers.authorization;
  const token = extractToken(authHeader);

  // If there's a bearer key check API key
  if (token) {
    const apiKey = await getValidApiKey(token);
    if (apiKey) {
      // API key can act as a user
      const contactId = headers['x-contact-id']?.toString();
      if (contactId) {
        const contact = await ContactsService.findOneBy({ id: contactId });
        if (contact) {
          return {
            method: 'api-key',
            contact,
            // API can never acquire superadmin role
            roles: contact.activeRoles.filter((r) => r !== 'superadmin'),
          };
        }
      } else {
        return {
          method: 'api-key',
          roles: apiKey.activeRoles,
        };
      }
    }
  } else if (request.user) {
    return {
      method: 'user',
      contact: request.user,
      roles: request.user.activeRoles,
    };
  }

  return { method: 'none', roles: [] };
}

async function getValidApiKey(key: string): Promise<ApiKey | undefined> {
  const [_, secret] = key.split('_');
  const secretHash = crypto.createHash('sha256').update(secret).digest('hex');
  const apiKey = await getRepository(ApiKey).findOneBy({ secretHash });
  return !!apiKey && (!apiKey.expires || apiKey.expires > new Date())
    ? apiKey
    : undefined;
}

// Use type of authentication to determine whether actor is user or API key
// Default to system
function authInfoToActor(auth: AuthInfo): ActivityActor {
  switch (auth.method) {
    case 'api-key':
      return {
        actorType: ActivityActorType.ApiKey,
        actorId: auth.contact?.id ?? null,
      };
    case 'user':
      return { actorType: ActivityActorType.User, actorId: auth.contact.id };
    default:
      return { actorType: ActivityActorType.System, actorId: null };
  }
}
