import OptionsService from '@beabee/core/services/OptionsService';
import { wrapAsync } from '@beabee/core/utils/express';

import express, { type Express, type Request, type Response } from 'express';

import { isSuperAdmin } from '#core/middleware';

const app: Express = express();

app.set('views', __dirname + '/views');

app.use(isSuperAdmin);

app.get('/', function (req: Request, res: Response) {
  const options = OptionsService.getAll();
  res.render('index', { options, showHidden: req.query.hidden !== undefined });
});

app.get('/:key/edit', function (req: Request, res: Response) {
  if (OptionsService.isKey(req.params.key)) {
    const option = OptionsService.get(req.params.key);
    res.locals.breadcrumb.push({
      name: option.key,
    });

    req.flash('warning', 'option-404');
    res.render('edit', { option });
  } else {
    res.redirect('/settings/options');
  }
});

app.post(
  '/:key/edit',
  wrapAsync(async function (req: Request, res: Response) {
    if (OptionsService.isKey(req.params.key)) {
      await OptionsService.set(req.params.key, req.body.value || '');
      req.flash('success', 'option-updated');
    }
    res.redirect('/settings/options');
  })
);

app.get('/:key/reset', function (req: Request, res: Response) {
  if (OptionsService.isKey(req.params.key)) {
    const option = OptionsService.get(req.params.key);
    res.locals.breadcrumb.push({
      name: option.key,
    });

    res.render('reset', { key: option.key });
  } else {
    req.flash('warning', 'option-404');
    res.redirect('/settings/options');
  }
});

app.post(
  '/:key/reset',
  wrapAsync(async function (req: Request, res: Response) {
    if (OptionsService.isKey(req.params.key)) {
      await OptionsService.reset(req.params.key);
      req.flash('success', 'option-reset');
    }
    res.redirect('/settings/options');
  })
);

export default app;
