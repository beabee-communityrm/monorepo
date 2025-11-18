import { getRepository } from '@beabee/core/database';
import {
  Email,
  EmailMailing,
  Segment,
  SegmentContact,
  SegmentOngoingEmail,
} from '@beabee/core/models';
import { wrapAsync } from '@beabee/core/utils/express';

import express, { type Express, type Request, type Response } from 'express';

import { cleanRuleGroup } from '#apps/members/app';
import { hasNewModel } from '#core/middleware';
import { getSegmentContacts } from '#core/utils/segments';

const app: Express = express();

app.set('views', __dirname + '/views');

app.get(
  '/',
  wrapAsync(async (req: Request, res: Response) => {
    const segments = await getRepository(Segment).find();
    res.render('index', { segments });
  })
);

app.get(
  '/:id',
  hasNewModel(Segment, 'id'),
  wrapAsync(async (req, res) => {
    const segment = req.model as Segment;
    const ongoingEmails = await getRepository(SegmentOngoingEmail).find({
      where: { segmentId: segment.id },
      relations: { email: true },
    });
    res.render('segment', { segment, ongoingEmails });
  })
);

app.post(
  '/:id',
  hasNewModel(Segment, 'id'),
  wrapAsync(async (req, res) => {
    const segment = req.model as Segment;

    switch (req.body.action) {
      case 'update':
        await getRepository(Segment).update(segment.id, {
          name: req.body.name,
          description: req.body.description || '',
          order: req.body.order || 0,
          newsletterTag: req.body.newsletterTag,
        });
        req.flash('success', 'segment-updated');
        res.redirect(req.originalUrl);
        break;
      case 'update-rules':
        await getRepository(Segment).update(segment.id, {
          ruleGroup: cleanRuleGroup(JSON.parse(req.body.rules)),
        });
        req.flash('success', 'segment-updated');
        res.redirect(req.originalUrl);
        break;
      case 'toggle-ongoing-email':
        await getRepository(SegmentOngoingEmail).update(
          req.body.ongoingEmailId,
          { enabled: req.body.ongoingEmailEnabled === 'true' }
        );
        res.redirect('/members/segments/' + segment.id + '#ongoingemails');
        break;
      case 'delete-ongoing-email':
        await getRepository(SegmentOngoingEmail).delete(
          req.body.ongoingEmailId
        );
        res.redirect('/members/segments/' + segment.id + '#ongoingemails');
        break;
      case 'delete':
        await getRepository(SegmentContact).delete({ segmentId: segment.id });
        await getRepository(SegmentOngoingEmail).delete({
          segmentId: segment.id,
        });
        await getRepository(Segment).delete(segment.id);

        req.flash('success', 'segment-deleted');
        res.redirect('/members/segments');
        break;
    }
  })
);

app.get(
  '/:id/email',
  hasNewModel(Segment, 'id'),
  wrapAsync(async (req, res) => {
    const segment = req.model as Segment;
    res.render('email', {
      segment,
      emails: await getRepository(Email).find(),
    });
  })
);

interface CreateBaseEmail {
  email: string;
  subject: string;
  body: string;
  fromName?: string;
  fromEmail?: string;
}

interface CreateOneOffEmail extends CreateBaseEmail {
  type: 'one-off';
}

interface CreateOngoingEmail extends CreateBaseEmail {
  type: 'ongoing';
  trigger: 'onJoin' | 'onLeave';
  sendNow?: boolean;
}

type CreateEmail = CreateOneOffEmail | CreateOngoingEmail;

app.post(
  '/:id/email',
  hasNewModel(Segment, 'id'),
  wrapAsync(async (req, res) => {
    const segment = req.model as Segment;
    const data = req.body as CreateEmail;

    const email =
      data.email === '__new__'
        ? await getRepository(Email).save({
            name: 'Email to segment ' + segment.name,
            subject: data.subject,
            body: data.body,
            fromName: data.fromName || null,
            fromEmail: data.fromEmail || null,
          })
        : await getRepository(Email).findOneByOrFail({ id: data.email });

    if (data.type === 'ongoing') {
      await getRepository(SegmentOngoingEmail).save({
        segment,
        trigger: data.trigger,
        email,
        enabled: true,
      });

      req.flash('success', 'segment-created-ongoing-email');
    }

    if (data.type === 'one-off' || data.sendNow) {
      const contacts = await getSegmentContacts(segment);
      const mailing = await getRepository(EmailMailing).save({
        email,
        emailField: 'Email',
        nameField: 'Name',
        mergeFields: {
          EMAIL: 'Email',
          NAME: 'Name',
          FNAME: 'FirstName',
          LNAME: 'LastName',
        },
        recipients: contacts.map((contact) => ({
          Email: contact.email,
          Name: contact.fullname,
          FirstName: contact.firstname,
          LastName: contact.lastname,
        })),
      });

      req.flash('warning', 'segment-preview-email');

      res.redirect(`/tools/emails/${email.id}/mailings/${mailing.id}?preview`);
    } else {
      res.redirect(`/members/segments/${segment.id}#ongoingemails`);
    }
  })
);

export default app;
