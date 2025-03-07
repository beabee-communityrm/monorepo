import "module-alias/register";

import {
  ContributionType,
  RESET_SECURITY_FLOW_TYPE
} from "@beabee/beabee-common";
import { input, password, select } from "@inquirer/prompts";
import moment from "moment";

import { getRepository } from "@beabee/core/database";
import { runApp } from "@beabee/core/server";
import { generatePassword } from "@beabee/core/utils/auth";

import ContactsService from "@beabee/core/services/ContactsService";
import ResetSecurityFlowService from "@beabee/core/services/ResetSecurityFlowService";

import { ContactRole } from "@beabee/core/models";

import config from "@beabee/core/config";

function notEmpty(s: string) {
  return s.trim() !== "";
}

/**
 * @deprecated This tool is deprecated and will be removed in the next major version.
 * Please use the new backend-cli user create command instead: yarn backend-cli user create
 */
runApp(async () => {
  console.warn(
    "\n⚠️  DEPRECATED: This new-user tool is deprecated and will be removed in the next major version.\n" +
      "Please use the new backend-cli user create command instead: yarn backend-cli user create\n"
  );

  const answers = {
    firstname: await input({ message: "First Name", validate: notEmpty }),
    lastname: await input({ message: "Last Name", validate: notEmpty }),
    email: await input({ message: "Email Address", validate: notEmpty }),
    password: await password({
      message: "Password (leave empty to generate reset password link)",
      validate: (s: string) => !s.trim()
    }),
    membership: await select({
      message: "Would you like to grant membership to the user?",
      choices: [
        { value: "Yes" },
        { value: "Yes (expires after 1 month)" },
        { value: "Yes (expired yesterday)" },
        { value: "No" }
      ],
      default: "Yes"
    }),
    role: await select({
      message: "What level of access do you wish to grant this new user?",
      choices: [
        { value: "None" },
        { value: "Admin" },
        { value: "Super Admin" }
      ],
      default: "Super Admin"
    })
  };

  const roles = [];

  if (answers.membership != "No") {
    const now = moment();
    let dateAdded: Date | null = null;
    let dateExpires: Date | null = null;
    switch (answers.membership) {
      case "Yes (expires after 1 month)":
        dateExpires = now.add("1", "months").toDate();
        break;
      case "Yes (expired yesterday)":
        dateAdded = now.subtract("1", "months").toDate();
        dateExpires = now.subtract("1", "day").toDate();
        break;
    }

    const membership = getRepository(ContactRole).create({
      type: "member",
      ...(dateAdded && { dateAdded }),
      dateExpires
    });
    roles.push(membership);
  }

  if (answers.role != "None") {
    const admin = getRepository(ContactRole).create({
      type: answers.role === "Admin" ? "admin" : "superadmin"
    });
    roles.push(admin);
  }

  const contact = await ContactsService.createContact({
    firstname: answers.firstname,
    lastname: answers.lastname,
    email: answers.email,
    contributionType: ContributionType.None,
    roles: roles,
    ...(answers.password && {
      password: await generatePassword(answers.password)
    })
  });

  if (!answers.password) {
    const rpFlow = await ResetSecurityFlowService.create(
      contact,
      RESET_SECURITY_FLOW_TYPE.PASSWORD
    );

    console.log(
      `Reset password link: ${config.audience}/auth/set-password/${rpFlow.id}`
    );
  }
});
