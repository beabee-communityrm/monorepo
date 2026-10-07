import type { LOGIN_ACTIONS } from '../data/login-actions.js';

export type LoginAction = (typeof LOGIN_ACTIONS)[number];
