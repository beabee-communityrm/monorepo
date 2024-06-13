import express from "express";
import _ from "lodash";
import moment from "moment";

import { database, wrapAsync } from "@beabee/core";
import { hasNewModel, hasSchema, isAdmin } from "#express";

import { Contact, Project, ProjectContact, ProjectEngagement } from "@beabee/models";

import { createProjectSchema } from "./schemas.json";

interface CreateProjectSchema {
  title: string;
  description: string;
  status: string;
  groupName?: string;
}

interface CreateEngagementSchema {
  type: string;
  date: string;
  time: string;
  notes: string;
  contactId: string;
}

interface UpdateProjectAction extends CreateProjectSchema {
  action: "update";
}

interface AddContactsAction {
  action: "add-contacts";
  contactIds: string[];
}

interface UpdateContactTagAction {
  action: "update-contact-tag";
  projectContactId: string;
  tag: string;
}

interface AddContactEngagementAction extends CreateEngagementSchema {
  action: "add-contact-engagement";
}

interface DeleteContactEngagementAction {
  action: "delete-contact-engagement";
  projectEngagementId: string;
}

interface DeleteProjectAction {
  action: "delete";
}

type UpdateAction =
  | UpdateProjectAction
  | AddContactsAction
  | UpdateContactTagAction
  | AddContactEngagementAction
  | DeleteContactEngagementAction
  | DeleteProjectAction;

function schemaToProject(
  data: CreateProjectSchema
): Pick<Project, "title" | "description" | "status" | "groupName"> {
  const { title, description, status, groupName } = data;
  return { title, description, status, groupName: groupName || null };
}

function schemaToEngagement(
  data: CreateEngagementSchema
): Pick<ProjectEngagement, "type" | "notes" | "date" | "toContact"> {
  const { type, date, time, notes } = data;
  return {
    type,
    notes,
    date: moment(`${date}T${time}`).toDate(),
    toContact: { id: data.contactId } as Contact
  };
}

const app = express();

app.set("views", __dirname + "/views");

app.use(isAdmin);

app.get(
  "/",
  wrapAsync(async (req, res) => {
    const projects = await database.createQueryBuilder(Project, "p")
      .loadRelationCountAndMap("p.contactCount", "p.contacts")
      .getMany();

    res.render("index", { projects });
  })
);

app.post(
  "/",
  hasSchema(createProjectSchema).orFlash,
  wrapAsync(async (req, res) => {
    const project = await database.getRepository(Project).save({
      ...schemaToProject(req.body),
      owner: req.user!
    });
    req.flash("success", "project-created");
    res.redirect("/projects/" + project.id);
  })
);

app.get(
  "/:id",
  hasNewModel(Project, "id", { relations: { owner: true } }),
  wrapAsync(async (req, res) => {
    const project = req.model as Project;

    const projectContacts = await database.getRepository(ProjectContact).find({
      where: { projectId: project.id },
      relations: { contact: { profile: true } }
    });
    const engagements = await database.getRepository(ProjectEngagement).find({
      where: { projectId: project.id },
      relations: { byContact: true, toContact: true }
    });

    const projectContactsWithEngagement = projectContacts.map((pm) => {
      const contactEngagements = engagements.filter(
        (e) => pm.contact.id === e.toContact.id
      );
      return {
        ...pm,
        engagements: contactEngagements,
        engagementsByDate: _.sortBy(contactEngagements, "date"),
        latestEngagement: contactEngagements[contactEngagements.length - 1]
      };
    });

    res.render("project", {
      project,
      projectContacts: projectContactsWithEngagement
    });
  })
);

app.post(
  "/:id",
  hasNewModel(Project, "id"),
  wrapAsync(async (req, res) => {
    const data = req.body as UpdateAction;
    const project = req.model as Project;

    switch (data.action) {
      case "update":
        await database.getRepository(Project).update(project.id, schemaToProject(data));
        req.flash("success", "project-updated");
        res.redirect(req.originalUrl);
        break;
      case "add-contacts":
        await database.getRepository(ProjectContact).insert(
          data.contactIds.map((contactId) => ({
            project,
            contact: { id: contactId }
          }))
        );
        req.flash("success", "project-members-added");
        res.redirect(req.originalUrl);
        break;
      case "update-contact-tag":
        await database.getRepository(ProjectContact).update(data.projectContactId, {
          tag: data.tag
        });
        res.redirect(req.originalUrl + "#contacts");
        break;
      case "add-contact-engagement":
        await database.getRepository(ProjectEngagement).insert({
          ...schemaToEngagement(data),
          project,
          byContact: req.user!
        });
        res.redirect(req.originalUrl + "#contacts");
        break;
      case "delete-contact-engagement":
        await database.getRepository(ProjectEngagement).delete(data.projectEngagementId);
        res.redirect(req.originalUrl + "#contacts");
        break;
      case "delete":
        await database.getRepository(ProjectEngagement).delete({
          projectId: project.id
        });
        await database.getRepository(ProjectContact).delete({ projectId: project.id });
        await database.getRepository(Project).delete(project.id);
        req.flash("success", "project-deleted");
        res.redirect("/projects");
        break;
    }
  })
);

export default app;
