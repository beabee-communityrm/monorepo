import '@beabee/vue/lib/theme';

import '@iframe-resizer/child';

import './index.css';
import { initializeApp } from './lib/bootstrap';
import { initializeTheme } from './lib/theme';

// Initialize theme system
initializeTheme();

if (import.meta.env.DEV) {
  const { installDevRequests } = await import('./utils/dev/requests');
  installDevRequests();
}

// Start the initialization process
initializeApp();
