import config from '@beabee/core/config';
import { createQueryBuilder } from '@beabee/core/database';
import { Callout } from '@beabee/core/models';
import PageSettingsService, {
  JustPageSettings,
} from '@beabee/core/services/PageSettingsService';
import { wrapAsync } from '@beabee/core/utils/express';

import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();

app.set('views', __dirname + '/views');

async function getCalloutShareSettings(
  uri: string
): Promise<JustPageSettings | undefined> {
  const parts = uri.substring('/crowdnewsrooms/'.length).split('?');
  const slug = parts[0].split('/')[0];
  const locale =
    parts[1]
      ?.split('&')
      .map((q) => q.split('='))
      .find(([k]) => k === 'lang')?.[1] || 'default';

  const callout = await createQueryBuilder(Callout, 'c')
    .innerJoinAndSelect('c.variants', 'v', 'v.name = :locale', { locale })
    .where('c.slug = :slug', { slug })
    .getOne();

  if (callout) {
    const variant = callout.variants.find((v) => v.name === locale);
    if (!variant) {
      throw new Error(
        `No variant found for callout ${callout.slug} and locale ${locale}`
      );
    }

    return {
      shareTitle: variant.shareTitle || variant.title,
      shareDescription: variant.shareDescription || variant.excerpt,
      shareImage: callout.image,
      shareUrl: config.audience + '/crowdnewsrooms/' + callout.slug,
    };
  }
}

app.get(
  '/',
  wrapAsync(async (req: Request, res: Response) => {
    let pageSettings: JustPageSettings | undefined;

    const uri = req.query.uri ? req.query.uri.toString() : undefined;
    if (uri) {
      pageSettings = uri.startsWith('/crowdnewsrooms/')
        ? await getCalloutShareSettings(uri)
        : PageSettingsService.getPath(uri);
    }

    res.render('index', pageSettings && { pageSettings });
  })
);

export default app;
