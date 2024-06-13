import express from "express";
import moment from "moment";

import { config } from "@beabee/config";

import {} from "@beabee/core";
import { isAdmin, canSuperAdmin } from "#express";
import {
  database,
  generateCode,
  wrapAsync,
  contactsService,
  optionsService,
  paymentService
} from "@beabee/core";

import { Contact, ResetSecurityFlow } from "@beabee/models";

import { RESET_SECURITY_FLOW_TYPE } from "@beabee/beabee-common";

const app = express();

async function getAvailableTags(): Promise<string[]> {
  return optionsService.getList("available-tags");
}

app.set("views", __dirname + "/views");

app.use(isAdmin);

app.use(
  wrapAsync(async (req, res, next) => {
    // Bit of a hack to get parent app params
    const contact = await contactsService.findOne({
      where: { id: req.allParams.uuid },
      relations: { profile: true }
    });
    if (contact) {
      req.model = contact;
      const { method, ...contribution } =
        await paymentService.getContribution(contact);
      res.locals.contribution = contribution;
      res.locals.paymentMethod = method;
      next();
    } else {
      next("route");
    }
  })
);

app.get(
  "/",
  wrapAsync(async (req, res) => {
    const contact = req.model as Contact;
    const availableTags = await getAvailableTags();

    const rpFlow = await database.getRepository(ResetSecurityFlow).findOne({
      where: { contactId: contact.id },
      order: { date: "DESC" }
    });

    res.render("index", {
      member: contact,
      rpFlow,
      availableTags,
      password_tries: config.passwordTries
    });
  })
);

app.post(
  "/",
  wrapAsync(async (req, res) => {
    const contact = req.model as Contact;

    if (!req.body.action.startsWith("save-") && !canSuperAdmin(req)) {
      req.flash("error", "403");
      res.redirect(req.baseUrl);
      return;
    }

    switch (req.body.action) {
      case "save-about": {
        await contactsService.updateContactProfile(contact, {
          tags: req.body.tags || [],
          description: req.body.description || "",
          bio: req.body.bio || ""
        });
        req.flash("success", "member-updated");
        break;
      }
      case "save-contact":
        await contactsService.updateContact(contact, {
          email: req.body.email
        });
        await contactsService.updateContactProfile(contact, {
          telephone: req.body.telephone || "",
          twitter: req.body.twitter || "",
          preferredContact: req.body.preferred || ""
        });
        req.flash("success", "member-updated");
        break;
      case "save-notes":
        await contactsService.updateContactProfile(contact, {
          notes: req.body.notes
        });
        req.flash("success", "member-updated");
        break;
      case "login-override":
        await contactsService.updateContact(contact, {
          loginOverride: {
            code: generateCode(),
            expires: moment().add(24, "hours").toDate()
          }
        });
        req.flash("success", "member-login-override-generated");
        break;
      case "password-reset":
        await database.getRepository(ResetSecurityFlow).save({
          contact,
          type: RESET_SECURITY_FLOW_TYPE.PASSWORD
        });
        req.flash("success", "member-password-reset-generated");
        break;
      case "permanently-delete":
        await contactsService.permanentlyDeleteContact(contact);

        req.flash("success", "member-permanently-deleted");
        res.redirect("/members");
        return;
    }

    res.redirect(req.baseUrl);
  })
);

export default app;
