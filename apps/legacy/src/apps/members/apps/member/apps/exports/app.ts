import express, { type Express } from 'express';

const app: Express = express();

app.set('views', __dirname + '/views');

export default app;
