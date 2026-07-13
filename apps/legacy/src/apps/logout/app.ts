import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();

// Logout is handled by the API's OIDC flow, which also ends the IdP session
app.get('/', function (req: Request, res: Response) {
  res.redirect('/api/1.0/auth/logout');
});

export default app;
