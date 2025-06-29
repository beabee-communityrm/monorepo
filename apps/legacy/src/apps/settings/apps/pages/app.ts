import { getRepository } from '@beabee/core/database';
import { PageSettings } from '@beabee/core/models';
import PageSettingsService from '@beabee/core/services/PageSettingsService';
import { wrapAsync } from '@beabee/core/utils/express';

import express, { type Express } from 'express';

import { hasNewModel, hasSchema, isAdmin } from '#core/middleware';

import { createPageSchema } from './schema.json';

interface CreatePageSchema {
  pattern: string;
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  shareImage: string;
}

const app: Express = express();

app.set('views', __dirname + '/views');

app.use(isAdmin);

app.get(
  '/',
  wrapAsync(async (req, res) => {
    const pages = await getRepository(PageSettings).find();
    res.render('index', { pages });
  })
);

function schemaToPageSettings(data: CreatePageSchema): PageSettings {
  const ps = new PageSettings();
  ps.pattern = data.pattern;
  ps.shareUrl = data.shareUrl;
  ps.shareTitle = data.shareTitle;
  ps.shareDescription = data.shareDescription;
  ps.shareImage = data.shareImage;

  return ps;
}

app.post(
  '/',
  hasSchema(createPageSchema).orFlash,
  wrapAsync(async (req, res) => {
    const ps = await PageSettingsService.create(schemaToPageSettings(req.body));
    req.flash('success', 'pages-created');
    res.redirect('/settings/pages/' + ps.id);
  })
);

app.get('/:id', hasNewModel(PageSettings, 'id'), (req, res) => {
  res.render('page', { page: req.model });
});

app.post(
  '/:id',
  hasNewModel(PageSettings, 'id'),
  wrapAsync(async (req, res) => {
    const ps = req.model as PageSettings;

    switch (req.body.action) {
      case 'update':
        await PageSettingsService.update(ps, schemaToPageSettings(req.body));
        req.flash('success', 'pages-updated');
        res.redirect('/settings/pages/' + ps.id);
        break;

      case 'delete':
        await PageSettingsService.delete(ps);
        req.flash('success', 'pages-deleted');
        res.redirect('/settings/pages');
        break;
    }
  })
);

export default app;
