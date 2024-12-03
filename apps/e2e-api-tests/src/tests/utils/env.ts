import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.example'] });

const env = process.env;

if(!env.API_KEY) {
    throw new Error('API_KEY is not set');
}

export const API_KEY = env.API_KEY;
export const HOST = env.APP_BASE_URL || 'http://localhost:3002';
export const PATH = env.API_BASE_URL || '/api/1.0';
