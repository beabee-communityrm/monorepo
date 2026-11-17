import type { SetupSystemArgs } from '../../types/setup.js';
import { setupAdmin } from './admin.js';
import { setupPaymentMethods } from './payment-methods.js';
import { setupSupportEmail } from './support-email.js';

/**
 * System setup that runs the basic setup steps in sequence:
 * 1. Support email configuration
 * 2. Payment methods configuration
 * 3. Initial admin user creation
 *
 * Integrations are set up separately with `setup integrations`
 *
 * Accepts command line arguments or prompts for missing information
 */
function cancelled(): void {
  console.error('❌ Setup cancelled before all steps were completed.');
  process.exitCode = 1;
}

export async function setupSystem(args: SetupSystemArgs): Promise<void> {
  try {
    console.log('🚀 Starting system setup...\n');
    console.log('This will configure:');
    console.log('1. Support email');
    console.log('2. Payment methods');
    console.log('3. Initial admin user');
    console.log('');

    // Step 1: Support Email Setup
    console.log('📧 Step 1/3: Setting up support email');
    console.log('='.repeat(50));
    if (!(await setupSupportEmail(args))) return cancelled();
    console.log('✅ Support email setup completed!\n');

    // Step 2: Payment Methods Setup
    console.log('💳 Step 2/3: Setting up payment methods');
    console.log('='.repeat(50));
    if (!(await setupPaymentMethods(args))) return cancelled();
    console.log('✅ Payment methods setup completed!\n');

    // Step 3: Admin User Setup
    console.log('👤 Step 3/3: Setting up initial admin user');
    console.log('='.repeat(50));
    if (!(await setupAdmin(args))) return cancelled();
    console.log('✅ Admin user setup completed!\n');

    // Final success message
    console.log('🎉 System setup finished successfully!');
    console.log('Your Beabee system is now ready to use.');
  } catch (error) {
    console.error('❌ Setup failed at one of the steps.');
    console.error(
      'You can run individual setup commands to complete the configuration:'
    );
    console.error('- yarn start setup support-email');
    console.error('- yarn start setup payment-methods');
    console.error('- yarn start setup admin');
    throw error;
  }
}
