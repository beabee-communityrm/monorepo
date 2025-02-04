import { runApp } from "@beabee/core/server";
import { contactsService } from "@beabee/core/services/ContactsService";

export const listUsers = async (email?: string): Promise<void> => {
  await runApp(async () => {
    const contacts = await contactsService.find({
      where: email ? { email } : {},
      relations: ["roles", "profile", "contribution"],
      order: { joined: "DESC" }
    });

    if (contacts.length === 0) {
      console.log(email ? `No users found for ${email}` : "No users found");
      return;
    }

    console.log("\nUsers:");
    console.log("--------------------------------------------------");
    for (const contact of contacts) {
      console.log(`ID: ${contact.id}`);
      console.log(`Name: ${contact.fullname}`);
      console.log(`Email: ${contact.email}`);
      console.log(`Joined: ${contact.joined.toISOString()}`);
      console.log(`Last seen: ${contact.lastSeen?.toISOString() || "Never"}`);

      if (contact.roles.length > 0) {
        console.log("Roles:");
        contact.roles.forEach((role) => {
          console.log(
            `  - ${role.type}${role.dateExpires ? ` (expires: ${role.dateExpires.toISOString()})` : ""}`
          );
        });
      }

      console.log(`Contribution Type: ${contact.contributionType}`);
      if (contact.contributionMonthlyAmount) {
        console.log(
          `Monthly Amount: €${contact.contributionMonthlyAmount.toFixed(2)}`
        );
      }
      if (contact.contributionPeriod) {
        console.log(`Contribution Period: ${contact.contributionPeriod}`);
      }

      if (contact.profile) {
        if (contact.profile.telephone) {
          console.log(`Telephone: ${contact.profile.telephone}`);
        }
        if (contact.profile.twitter) {
          console.log(`Twitter: ${contact.profile.twitter}`);
        }
        if (contact.profile.description) {
          console.log(`Description: ${contact.profile.description}`);
        }
        if (contact.profile.newsletterStatus) {
          console.log(`Newsletter Status: ${contact.profile.newsletterStatus}`);
        }
      }

      console.log("--------------------------------------------------");
    }
  });
};
