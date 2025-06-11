import { input, password, confirm } from '@inquirer/prompts';
import { createUser } from '../user/create.js';
import type { CreateUserArgs } from '../../types/index.js';
import type { SetupAdminArgs } from '../../types/setup.js';

/**
 * Interactive setup for creating an initial admin user
 * Role is automatically set to superadmin and membership to permanent
 * Accepts command line arguments or prompts for missing information
 */
export async function setupAdmin(args: SetupAdminArgs = {}): Promise<void> {
  try {
    console.log('Setting up initial admin user...\n');

    // Collect user information through prompts or use provided arguments
    const firstname =
      args.firstname ||
      (await input({
        message: 'First name:',
        validate: (input: string) => {
          if (input.trim() === '') {
            return 'First name is required';
          }
          return true;
        },
      }));

    const lastname =
      args.lastname ||
      (await input({
        message: 'Last name:',
        validate: (input: string) => {
          if (input.trim() === '') {
            return 'Last name is required';
          }
          return true;
        },
      }));

    const email =
      args.email ||
      (await input({
        message: 'Email address:',
        validate: (input: string) => {
          if (input.trim() === '') {
            return 'Email is required';
          }
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input)) {
            return 'Please enter a valid email address';
          }
          return true;
        },
      }));

    let userPassword = args.password || '';

    // Only ask about password if not provided via command line
    if (!args.password) {
      const setPassword = await confirm({
        message:
          'Do you want to set a password now? (No = generate reset password link)',
        default: false,
      });

      if (setPassword) {
        userPassword = await password({
          message: 'Password:',
          validate: (input: string) => {
            if (input.length < 8) {
              return 'Password must be at least 8 characters long';
            }
            return true;
          },
        });
      }
    }

    // Show summary and confirm
    console.log('\n--- Admin User Summary ---');
    console.log(`Name: ${firstname} ${lastname}`);
    console.log(`Email: ${email}`);
    console.log(
      `Password: ${userPassword ? 'Set' : 'Will generate reset link'}`
    );
    console.log(`Membership: permanent`);
    console.log(`Role: superadmin`);

    const confirmCreate = await confirm({
      message: 'Create this admin user?',
      default: true,
    });

    if (!confirmCreate) {
      console.log('Admin user creation cancelled.');
      return;
    }

    // Create the admin user with collected data
    const userArgs: CreateUserArgs = {
      firstname,
      lastname,
      email,
      password: userPassword,
      membership: 'permanent', // Fixed to permanent
      role: 'superadmin', // Fixed to superadmin
    };

    await createUser(userArgs);
    console.log('✅ Initial admin user created successfully!');
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ExitPromptError'
    ) {
      console.log('\nOperation cancelled by user.');
      return;
    }
    throw error;
  }
}
