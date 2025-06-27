import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
} = JSON.parse(readFileSync(resolve(process.cwd(), './package.json'), 'utf8'));
