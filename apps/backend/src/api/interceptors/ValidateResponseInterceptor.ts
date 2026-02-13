import { log as mainLogger } from '@beabee/core/logging';

import { validateOrReject } from '#api/utils';
import { Request } from 'express';
import { ServerResponse } from 'node:http';
import {
  Action,
  Interceptor,
  InterceptorInterface,
  InternalServerError,
} from 'routing-controllers';

const log = mainLogger.child({ app: 'validate-response-interceptor' });

/**
 * Interceptor to validate outgoing responses against their DTO definitions.
 *
 * The primary goal is to act as a safeguard against accidentally leaking data
 * that shouldn't be exposed, especially differentiating between regular users
 * and administrators using validation groups.
 *
 * It validates each item in the response content (if it's an array) or the content
 * itself against the DTO using class-validator. Validation groups are applied based
 * on the user's role ('admin' group for administrators).
 *
 * Currently, validation errors are logged but do not throw an error to the client,
 * allowing potentially invalid responses to pass through while providing visibility
 * into validation failures.
 *
 * This was initially intended as a global interceptor, applied to all routes.
 */
@Interceptor()
export class ValidateResponseInterceptor implements InterceptorInterface {
  async intercept(action: Action, content: any) {
    // Skip validation for:
    // - undefined/null content
    // - ServerResponse objects
    // - Buffer objects (for binary data like images)
    if (
      content === undefined ||
      content === null ||
      content instanceof ServerResponse ||
      Buffer.isBuffer(content) // Allow file uploads without validation
    ) {
      return content;
    }

    const request = action.request as Request;
    const groups = request.user?.hasRole('admin') ? ['admin'] : [];
    const items = Array.isArray(content) ? content : [content];

    try {
      for (const item of items) {
        await validateOrReject(item, {
          groups,
          always: true,
          strictGroups: true,
          whitelist: true,
          forbidUnknownValues: true,
          forbidNonWhitelisted: true,
          validationError: { target: false },
        });
      }
    } catch (errors) {
      log.warning(
        `Validation failed on response for ${content?.constructor?.name ?? 'unknown'}`,
        { errors }
      );
      // TODO: Just log error for now
      // throw new InternalServerError("Validation failed");
    }

    return content;
  }
}
