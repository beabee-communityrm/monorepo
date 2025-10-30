import { createQueryBuilder, getRepository } from '@beabee/core/database';
import { Email, EmailMailing, SegmentOngoingEmail } from '@beabee/core/models';
import { emailService } from '@beabee/core/services/EmailService';
import OptionsService from '@beabee/core/services/OptionsService';
import { formatEmailBody } from '@beabee/core/templates/email';
import { EmailMailingRecipient, EmailTemplateId } from '@beabee/core/type';
import { wrapAsync } from '@beabee/core/utils/express';

import busboy from 'connect-busboy';
import express, { type Express } from 'express';
import _ from 'lodash';
import Papa from 'papaparse';

import { hasNewModel, isAdmin } from '#core/middleware';

const app: Express = express();

export interface EmailSchema {
  name: string;
  fromName?: string;
  fromEmail?: string;
  subject: string;
  body: string;
}

export function schemaToEmail(data: EmailSchema): Email {
  const email = new Email();
  email.name = data.name;
  email.fromName = data.fromName || null;
  email.fromEmail = data.fromEmail || null;
  email.subject = data.subject;
  email.body = data.body;

  return email;
}

interface EmailType {
  name: string;
  showContactFields?: true;
  mergeFields: [string, string][];
}

const assignableSystemEmails: Partial<Record<EmailTemplateId, EmailType>> = {
  // Member emails
  welcome: {
    name: 'Welcome',
    showContactFields: true,
    mergeFields: [],
  },
  'reset-password': {
    name: 'Reset password',
    showContactFields: true,
    mergeFields: [],
  },
  'reset-device': {
    name: 'Reset device',
    showContactFields: true,
    mergeFields: [],
  },
  'cancelled-contribution': {
    name: 'Cancelled contribution',
    showContactFields: true,
    mergeFields: [
      ['EXPIRES', 'Contribution expiry date'],
      ['MEMBERSHIPID', 'Contact ID'],
    ],
  },
  'cancelled-contribution-no-survey': {
    name: 'Cancelled contribution - no survey',
    showContactFields: true,
    mergeFields: [['EXPIRES', 'Contribution expiry date']],
  },
  'manual-to-automatic': {
    name: 'Manual contributor converted to automatic',
    showContactFields: true,
    mergeFields: [],
  },
  'email-exists-login': {
    name: 'Email exists - login',
    showContactFields: true,
    mergeFields: [],
  },
  'email-exists-set-password': {
    name: 'Email exists - set password',
    showContactFields: true,
    mergeFields: [],
  },
  'callout-response-answers': {
    name: 'Callout response confirmation',
    showContactFields: true,
    mergeFields: [
      ['MESSAGE', 'Custom message'],
      ['CALLOUTTITLE', 'Callout title'],
      ['CALLOUTLINK', 'Callout link'],
      ['SUPPORTEMAIL', 'Support email address'],
    ],
  },
  // General emails
  'confirm-email': {
    name: 'Confirm email',
    mergeFields: [
      ['FNAME', 'Contact first name'],
      ['LNAME', 'Contact last name'],
      ['CONFIRMLINK', 'Confirm email link'],
    ],
  },
  // Admin emails
  'new-member': {
    name: 'Admin: New contact notification',
    mergeFields: [
      ['MEMBERID', 'Contact ID'],
      ['MEMBERNAME', 'Contact name'],
    ],
  },
  'cancelled-member': {
    name: 'Admin: Cancelled member notification',
    mergeFields: [
      ['MEMBERID', 'Contact ID'],
      ['MEMBERNAME', 'Contact name'],
    ],
  },
  'new-callout-response': {
    name: 'Admin: New callout response notification',
    mergeFields: [
      ['CALLOUTSLUG', 'Callout slug'],
      ['CALLOUTTITLE', 'Callout title'],
      ['RESPNAME', 'Responder name'],
    ],
  },
};

function providerTemplateMap() {
  return OptionsService.getJSON('email-templates');
}

app.set('views', __dirname + '/views');

app.use(isAdmin);

app.get(
  '/',
  wrapAsync(async (req, res) => {
    const emails = await createQueryBuilder(Email, 'e')
      .loadRelationCountAndMap('e.mailingCount', 'e.mailings')
      .orderBy({ name: 'ASC' })
      .getMany();

    const segmentEmails = await getRepository(SegmentOngoingEmail).find();
    const systemEmails = Object.values(providerTemplateMap());

    const emailsWithFlags = emails.map((email) => ({
      ...email,
      isSystem: systemEmails.indexOf(email.id) > -1,
      isSegment: segmentEmails.findIndex((se) => se.emailId === email.id) > -1,
    }));

    res.render('index', { emails: emailsWithFlags });
  })
);

app.post(
  '/',
  wrapAsync(async (req, res) => {
    const emails = await getRepository(Email).save(schemaToEmail(req.body));
    res.redirect('/tools/emails/' + emails.id);
  })
);

app.get(
  '/:id',
  hasNewModel(Email, 'id'),
  wrapAsync(async (req, res) => {
    const email = req.model as Email;

    const mailings = await getRepository(EmailMailing).find({
      where: { emailId: email.id },
      order: { createdDate: 'ASC' },
    });
    const segmentEmails = await getRepository(SegmentOngoingEmail).find({
      where: { emailId: email.id },
      relations: { segment: true },
    });
    const systemEmails = Object.entries(providerTemplateMap())
      .filter(([systemId, emailId]) => emailId === email.id)
      .map(([systemId]) => systemId);

    res.render('email', {
      email,
      mailings,
      segmentEmails,
      systemEmails,
      assignableSystemEmails,
    });
  })
);

app.post(
  '/:id',
  hasNewModel(Email, 'id'),
  wrapAsync(async (req, res) => {
    const email = req.model as Email;

    switch (req.body.action) {
      case 'update':
        await getRepository(Email).update(email.id, schemaToEmail(req.body));
        req.flash('success', 'transactional-email-updated');
        res.redirect(req.originalUrl);
        break;
      case 'update-system-emails': {
        const newEmailTemplates = Object.assign(
          {},
          providerTemplateMap(),
          // Unassigned all triggers assigned to this email
          ...Object.entries(providerTemplateMap())
            .filter(([systemEmail, emailId]) => emailId === email.id)
            .map(([systemEmail]) => ({ [systemEmail]: undefined })),
          // (Re)assign the new trigger
          ...((req.body.systemEmails || []) as string[]).map((systemEmail) => ({
            [systemEmail]: email.id,
          }))
        );
        OptionsService.setJSON('email-templates', newEmailTemplates);
        req.flash('success', 'transactional-email-updated');
        res.redirect(req.originalUrl);
        break;
      }
      case 'delete':
        await getRepository(EmailMailing).delete({ emailId: email.id });
        await getRepository(Email).delete(email.id);
        req.flash('success', 'transactional-email-deleted');
        res.redirect('/tools/emails');
        break;
    }
  })
);

app.post('/:id/mailings', hasNewModel(Email, 'id'), busboy(), (req, res) => {
  const email = req.model as Email;
  let recipients: EmailMailingRecipient[];

  req.busboy.on('file', (fieldname, file) => {
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        recipients = results.data as EmailMailingRecipient[];
      },
    });
  });
  req.busboy.on('finish', async () => {
    const mailing = new EmailMailing();
    mailing.email = email;
    mailing.recipients = recipients;
    const savedMailing = await getRepository(EmailMailing).save(mailing);
    res.redirect(`/tools/emails/${email.id}/mailings/${savedMailing.id}`);
  });

  req.pipe(req.busboy);
});

app.get(
  '/:id/mailings/:mailingId',
  hasNewModel(Email, 'id'),
  wrapAsync(async (req, res, next) => {
    const email = req.model as Email;
    const mailing = await getRepository(EmailMailing).findOneBy({
      id: req.params.mailingId,
    });
    if (!mailing) return next('route');

    const matches = email.body.match(/\*\|[^|]+\|\*/g) || [];
    const mergeFields = _.uniq(
      matches.map((f) => f.substring(2, f.length - 2))
    );
    res.render('mailing', {
      email,
      emailBody: formatEmailBody(email.body),
      mailing,
      mergeFields,
      headers: Object.keys(mailing.recipients[0]),
      onlyPreview: req.query.preview !== undefined,
    });
  })
);

interface SendSchema {
  emailField: string;
  nameField: string;
  mergeFields: Record<string, string>;
}

app.post(
  '/:id/mailings/:mailingId',
  hasNewModel(Email, 'id'),
  wrapAsync(async (req, res, next) => {
    const email = req.model as Email;
    const mailing = await getRepository(EmailMailing).findOneBy({
      id: req.params.mailingId,
    });
    if (!mailing) return next('route');

    const { emailField, nameField, mergeFields }: SendSchema = req.body;

    const recipients = mailing.recipients.map((recipient) => ({
      to: {
        email: recipient[emailField],
        name: recipient[nameField],
      },
      mergeFields: _.mapValues(
        mergeFields,
        (valueField) => recipient[valueField]
      ),
    }));

    await emailService.sendEmail(email, recipients);

    await getRepository(EmailMailing).update(mailing.id, {
      sentDate: new Date(),
      emailField,
      nameField,
      mergeFields,
    });

    req.flash('success', 'transactional-email-sending');

    res.redirect(req.originalUrl);
  })
);

export default app;
