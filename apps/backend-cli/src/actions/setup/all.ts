import type { SetupAllArgs } from '../../types/setup.js';
import { setupAdmin } from './admin.js';
import { setupStripe } from './integrations.js';
import { setupPaymentMethods } from './payment-methods.js';
import { setupSupportEmail } from './support-email.js';

/**
 * Complete system setup that runs all setup steps in sequence:
 * 1. Support email configuration
 * 2. Payment methods configuration
 * 3. Stripe integration setup
 * 4. Initial admin user creation
 *
 * Accepts command line arguments or prompts for missing information
 */
export async function setupAll(args: SetupAllArgs): Promise<void> {
  try {
    console.log('🚀 Starting complete system setup...\n');
    console.log('This will configure:');
    console.log('1. Support email');
    console.log('2. Payment methods');
    console.log('3. Stripe integration');
    console.log('4. Initial admin user');
    console.log('');

    // Step 1: Support Email Setup
    console.log('📧 Step 1/4: Setting up support email');
    console.log('='.repeat(50));
    await setupSupportEmail(args);
    console.log('✅ Support email setup completed!\n');

    // Step 2: Payment Methods Setup
    console.log('💳 Step 2/4: Setting up payment methods');
    console.log('='.repeat(50));
    await setupPaymentMethods(args);
    console.log('✅ Payment methods setup completed!\n');

    // Step 3: Stripe Integration Setup
    console.log('🔧 Step 3/4: Setting up Stripe integration');
    console.log('='.repeat(50));
    await setupStripe(false);
    console.log('✅ Stripe integration setup completed!\n');

    // Step 4: Admin User Setup
    console.log('👤 Step 4/4: Setting up initial admin user');
    console.log('='.repeat(50));
    const adminArgs: any = {};
    if (args.firstname) adminArgs.firstname = args.firstname;
    if (args.lastname) adminArgs.lastname = args.lastname;
    if (args.email) adminArgs.email = args.email;
    if (args.password) adminArgs.password = args.password;
    await setupAdmin(adminArgs);
    console.log('✅ Admin user setup completed!\n');

    // Final success message
    console.log('🎉 Complete system setup finished successfully!');
    console.log('Your Beabee system is now ready to use.');
  } catch (error) {
    console.error('❌ Setup failed at one of the steps.');
    console.error(
      'You can run individual setup commands to complete the configuration:'
    );
    console.error('- yarn start setup support-email');
    console.error('- yarn start setup payment-methods');
    console.error('- yarn start setup integrations stripe');
    console.error('- yarn start setup admin');
    throw error;
  }
}
