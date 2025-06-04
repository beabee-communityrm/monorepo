import { input, confirm } from "@inquirer/prompts";
import { deleteUser } from "./delete.js";

/**
 * Interactive version of delete user command
 * Prompts user for email and shows multiple confirmation warnings
 */
export async function deleteUserInteractive(): Promise<void> {
  try {
    console.log("⚠️  WARNING: This will permanently delete a user account!\n");

    // Get email to delete
    const email = await input({
      message: "Enter the email address of the user to delete:",
      validate: (input: string) => {
        if (input.trim() === "") {
          return "Email is required";
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          return "Please enter a valid email address";
        }
        return true;
      }
    });

    // Show warning and first confirmation
    console.log(`\n🚨 You are about to permanently delete the user: ${email}`);
    console.log("This action cannot be undone and will remove:");
    console.log("- User account and profile");
    console.log("- All user data and associations");
    console.log("- Any payment methods and subscription data");

    const firstConfirm = await confirm({
      message: "Are you absolutely sure you want to delete this user?",
      default: false
    });

    if (!firstConfirm) {
      console.log("User deletion cancelled.");
      return;
    }

    // Second confirmation with exact email
    const secondConfirm = await confirm({
      message: `Type confirmation: Do you really want to delete "${email}"?`,
      default: false
    });

    if (!secondConfirm) {
      console.log("User deletion cancelled.");
      return;
    }

    // Final confirmation
    const emailConfirmation = await input({
      message: `To confirm, please type the email address again: "${email}"`,
      validate: (input: string) => {
        if (input !== email) {
          return `Email does not match. Please type exactly: ${email}`;
        }
        return true;
      }
    });

    console.log("\nProceeding with user deletion...");

    // Call the existing delete function
    await deleteUser(emailConfirmation);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ExitPromptError"
    ) {
      console.log("\nOperation cancelled by user.");
      return;
    }
    throw error;
  }
}
