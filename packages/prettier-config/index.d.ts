// Handwritten typescript types for prettier config, please keep in sync with index.mjs
import type { Config } from 'prettier';

export const baseConfig: Config;
export const frontendConfig: Config & { plugins: string[] };
