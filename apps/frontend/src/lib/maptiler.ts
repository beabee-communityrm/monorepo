import { config, geocoding } from '@maptiler/client';
import env from '../env';

config.apiKey = env.maptilerKey;

export { geocoding };
