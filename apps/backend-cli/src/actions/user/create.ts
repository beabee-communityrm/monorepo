import {
  ContributionType,
  RESET_SECURITY_FLOW_TYPE
} from "@beabee/beabee-common";
import { runApp } from "@beabee/core/server";
import { getRepository } from "@beabee/core/database";
import { generatePassword } from "@beabee/core/utils/auth";
import { ContactRole } from "@beabee/core/models";
import moment from "moment";

import { contactsService } from "@beabee/core/services/ContactsService";
import { resetSecurityFlowService } from "@beabee/core/services/ResetSecurityFlowService";
import { config } from "@beabee/core/config";

import type { CreateUserArgs } from "../../types/user.js";

export const createUser = async (argv: CreateUserArgs): Promise<void> => {
  await runApp(async () => {
    const roles: ContactRole[] = [];

    if (argv.membership !== "none") {
      const now = moment();
      let dateAdded: Date | null = null;
      let dateExpires: Date | null = null;

      switch (argv.membership) {
        case "monthly":
          dateExpires = now.add("1", "months").toDate();
          break;
        case "expired":
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

    if (argv.role !== "none") {
      const admin = getRepository(ContactRole).create({
        type: argv.role === "admin" ? "admin" : "superadmin"
      });
      roles.push(admin);
    }

    const contact = await contactsService.createContact({
      firstname: argv.firstname,
      lastname: argv.lastname,
      email: argv.email,
      contributionType: ContributionType.None,
      roles: roles,
      ...(argv.password && {
        password: await generatePassword(argv.password)
      })
    });

    if (!argv.password) {
      const rpFlow = await resetSecurityFlowService.create(
        contact,
        RESET_SECURITY_FLOW_TYPE.PASSWORD
      );

      console.log(
        `Reset password link: ${config.audience}/auth/set-password/${rpFlow.id}`
      );
    } else {
      console.log("User created successfully!");
    }
  });
};
