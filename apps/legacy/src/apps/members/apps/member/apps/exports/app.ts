import express, { type Express } from 'express';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.set('views', __dirname + '/views');

export default app;
