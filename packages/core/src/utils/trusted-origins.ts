import config from '#config/config';
import { optionsService } from '#services/OptionsService';

/** Origins trusted for CORS, embedding and return URLs: environment plus admin-managed option */
export function getTrustedOrigins(): string[] {
  return [
    ...config.trustedOrigins,
    ...optionsService.getList('trusted-origins'),
  ];
}
