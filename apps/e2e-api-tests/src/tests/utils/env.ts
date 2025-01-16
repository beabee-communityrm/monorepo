const env = process.env;

if(!env.API_KEY) {
    throw new Error('API_KEY is not set');
}

export const API_KEY = env.API_KEY;
export const HOST = env.BEABEE_AUDIENCE || 'http://localhost:4002';
export const PATH = env.API_BASE_URL || '/api/1.0';
