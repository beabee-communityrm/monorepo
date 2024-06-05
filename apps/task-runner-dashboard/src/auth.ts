import type { Request, Response, NextFunction } from 'express';

const TASK_RUNNER_DASHBOARD_PASSWORD = process.env.TASK_RUNNER_DASHBOARD_PASSWORD || 'password123';

// TODO use beabee backend auth
export const basicAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).send('Authentication required.');
    }

    const encoded = authHeader.split(' ')[1];
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const [username, password] = decoded.split(':');


    if (username === 'admin' && password === TASK_RUNNER_DASHBOARD_PASSWORD) {
        next();
    } else {
        res.status(403).send('Access Denied');
    }
};
