import type { ContentId } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { Content } from '@beabee/core/models';
import OptionsService from '@beabee/core/services/OptionsService';
import { wrapAsync } from '@beabee/core/utils/express';

import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

import { isAdmin } from '#core/middleware';

const app: Express = express();

app.set('views', __dirname + '/views');

app.use(isAdmin);

app.get(
  '/',
  wrapAsync(async (req: Request, res: Response) => {
    const content = await getRepository(Content).find();
    function get(id: ContentId) {
      return content.find((c) => c.id === id)?.data || {};
    }
    res.render('index', {
      general: get('general'),
      join: get('join'),
      joinSetup: get('join/setup'),
      profile: get('profile'),
      payment: get('payment'),
      telegram: get('telegram'),
    });
  })
);

const parseData = {
  general: (data: any) => ({
    ...data,
    hideContribution: data.hideContribution === 'true',
  }),
  join: (data: any) => ({
    ...data,
    initialAmount: Number(data.initialAmount),
    periods: data.periods.map((p: { name: string; presetAmounts: string }) => ({
      name: p.name,
      presetAmounts: p.presetAmounts.split(',').map((s) => Number(s.trim())),
    })),
    showNoContribution: data.showNoContribution === 'true',
    paymentMethods: data.paymentMethods
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => !!s),
  }),
  'join/setup': (data: any) => ({
    ...data,
    showNewsletterOptIn: data.showNewsletterOptIn === 'true',
  }),
  profile: (d: any) => d,
  contacts: (d: any) => d,
  share: (d: any) => d,
  email: (d: any) => d,
  payment: (d: any) => d,
  telegram: (d: any) => d,
} as const;

// urlencoding parser doesn't support overwriting if the same query param
// appears multiple times, we use this to submit checkboxes
// Turn options[key] = [a, b] into options[key] = b
function dedupeOptions(req: Request, res: Response, next: NextFunction) {
  if (req.body.options) {
    for (const opt in req.body.options) {
      const value = req.body.options[opt];
      if (Array.isArray(value)) {
        req.body.options[opt] = value[value.length - 1];
      }
    }
  }
  next();
}

app.post(
  '/',
  dedupeOptions,
  wrapAsync(async (req, res) => {
    if (req.body.id) {
      const id = req.body.id as ContentId;
      await getRepository(Content).save({
        id,
        data: parseData[id](req.body.data || {}),
      });
    }

    if (req.body.options) {
      await OptionsService.set(req.body.options);
    }

    res.redirect('/settings/content');
  })
);

export default app;
