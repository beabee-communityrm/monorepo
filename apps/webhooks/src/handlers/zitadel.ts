import { verifyZitadelSignature } from '@beabee/core/lib/zitadel-signature';
import { log as mainLogger } from '@beabee/core/logging';
import { idpService } from '@beabee/core/services/IdpService';
import { optionsService } from '@beabee/core/services/OptionsService';
import { wrapAsync } from '@beabee/core/utils/express';

import bodyParser from 'body-parser';
import express, { type Express } from 'express';

const log = mainLogger.child({ app: 'webhook-zitadel' });

const zitadelWebhookApp: Express = express();

zitadelWebhookApp.use(bodyParser.raw({ type: 'application/json' }));

/**
 * Actions v2 target: Zitadel calls this before it sets a token's claims and
 * merges the claims in the answer. The signing key is stored by
 * `setup integrations idp` when it registers the target.
 */
zitadelWebhookApp.post(
  '/claims',
  wrapAsync(async (req, res) => {
    const signature = req.headers['zitadel-signature'];
    const signingKey = optionsService.getText('zitadel-claims-signing-key');
    if (
      !signingKey ||
      typeof signature !== 'string' ||
      !verifyZitadelSignature(signature, req.body, signingKey)
    ) {
      log.warn('Rejected claims request with an invalid signature');
      return res.sendStatus(401);
    }

    const { user } = JSON.parse(req.body.toString()) as {
      user?: { id?: string };
    };
    const claims = user?.id ? await idpService.getTokenClaims(user.id) : {};
    res.json({
      append_claims: Object.entries(claims).map(([key, value]) => ({
        key,
        value,
      })),
    });
  })
);

export { zitadelWebhookApp };
