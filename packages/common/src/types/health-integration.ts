import type { HEALTH_INTEGRATIONS } from '../data/index.js';

export type HealthIntegration = (typeof HEALTH_INTEGRATIONS)[number];
