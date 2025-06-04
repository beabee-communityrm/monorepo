import { input, select, password, confirm } from "@inquirer/prompts";
import { createUser } from "./create.js";
import type { CreateUserArgs } from "../../types/index.js";

/**
 * Interactive version of create user command
 * Prompts user for all required information
 */
export async function createUserInteractive(): Promise<void> {
  try {
    console.log("Creating a new user...\n");

    // Collect user information through prompts
    const firstname = await input({
      message: "First name:",
      validate: (input: string) => {
        if (input.trim() === "") {
          return "First name is required";
        }
        return true;
      }
    });

    const lastname = await input({
      message: "Last name:",
      validate: (input: string) => {
        if (input.trim() === "") {
          return "Last name is required";
        }
        return true;
      }
    });

    const email = await input({
      message: "Email address:",
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

    // Ask if user wants to set a password or generate reset link
    const setPassword = await confirm({
      message:
        "Do you want to set a password now? (No = generate reset password link)",
      default: false
    });

    let userPassword = "";
    if (setPassword) {
      userPassword = await password({
        message: "Password:",
        validate: (input: string) => {
          if (input.length < 8) {
            return "Password must be at least 8 characters long";
          }
          return true;
        }
      });
    }

    const membership = await select({
      message: "Membership type:",
      choices: [
        { name: "Permanent", value: "permanent" },
        { name: "Monthly", value: "monthly" },
        { name: "Expired", value: "expired" },
        { name: "None", value: "none" }
      ],
      default: "permanent"
    });

    const role = await select({
      message: "User role:",
      choices: [
        { name: "Super Admin", value: "superadmin" },
        { name: "Admin", value: "admin" },
        { name: "None", value: "none" }
      ],
      default: "superadmin"
    });

    // Show summary and confirm
    console.log("\n--- User Summary ---");
    console.log(`Name: ${firstname} ${lastname}`);
    console.log(`Email: ${email}`);
    console.log(
      `Password: ${setPassword ? "Set" : "Will generate reset link"}`
    );
    console.log(`Membership: ${membership}`);
    console.log(`Role: ${role}`);

    const confirmCreate = await confirm({
      message: "Create this user?",
      default: true
    });

    if (!confirmCreate) {
      console.log("User creation cancelled.");
      return;
    }

    // Create the user with collected data
    const userArgs: CreateUserArgs = {
      firstname,
      lastname,
      email,
      password: userPassword,
      membership: membership as "none" | "permanent" | "monthly" | "expired",
      role: role as "none" | "admin" | "superadmin"
    };

    await createUser(userArgs);
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
