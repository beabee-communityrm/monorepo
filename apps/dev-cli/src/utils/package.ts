import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const _dirname = dirname(fileURLToPath(import.meta.url));

export const packageJson: {
  version: string;
  description: string;
  name: string;
  author: string;
  license: string;
  repository: {
    type: string;
    url: string;
  };
  // And so on...
  [key: string]: any;
} = JSON.parse(readFileSync(resolve(_dirname, '../../package.json'), 'utf8'));
