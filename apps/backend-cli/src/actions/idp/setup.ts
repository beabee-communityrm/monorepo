import { runApp } from '@beabee/core/server';
import { idpService } from '@beabee/core/services/IdpService';

/**
 * Apply the identity provider settings beabee owns: login and notification
 * policies and the branding
 */
export const setupIdp = async (): Promise<void> => {
  await runApp(async () => {
    if (!idpService.isEnabled) {
      console.error(
        'No identity provider configured, set BEABEE_IDP_PROVIDER first'
      );
      process.exitCode = 1;
      return;
    }

    if (await idpService.setup()) {
      console.log('Identity provider set up');
    } else {
      console.error('Failed to set up identity provider');
      process.exitCode = 1;
    }
  });
};
