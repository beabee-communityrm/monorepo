import config from '@beabee/core/config';
import { getRepository } from '@beabee/core/database';
import { ProjectContact } from '@beabee/core/models';
import { wrapAsync } from '@beabee/core/utils/express';

import DiscourseSSO from 'discourse-sso';
import express from 'express';

import { isLoggedIn } from '#core/middleware';
import { hasUser } from '#core/utils/index';

const sso = new DiscourseSSO(config.discourse.ssoSecret);

const app = express();

app.use(isLoggedIn);

app.get(
  '/sso',
  wrapAsync(
    hasUser(async (req, res) => {
      const { sso: payload, sig } = req.query;

      if (payload && sig && sso.validate(payload as string, sig as string)) {
        const projectContacts = await getRepository(ProjectContact).find({
          where: { contactId: req.user.id },
          relations: { project: true },
        });

        const groups = projectContacts
          .map((pm) => pm.project.groupName)
          .filter((g): g is string => !!g);

        const nonce = sso.getNonce(payload as string);
        const loginPayload = {
          nonce,
          email: req.user.email,
          external_id: req.user.id,
          name: req.user.fullname,
          username: req.user.email,
          add_groups: groups,
        };
        const q = sso.buildLoginString(loginPayload);
        res.redirect(`${config.discourse.url}/session/sso_login?${q}`);
      } else {
        res.status(403).send({ error: 'Invalid signature' });
      }
    })
  )
);

module.exports = app;
