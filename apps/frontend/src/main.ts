import '@beabee/vue/lib/theme';

import '@iframe-resizer/child';

import './index.css';
import { initializeApp } from './lib/bootstrap';
import { devPanelReady } from './lib/dev-panel';
import { initializeTheme } from './lib/theme';

// Initialize theme system
initializeTheme();

// So the dev panel, if it's on, sees the startup requests
await devPanelReady();

// Start the initialization process
initializeApp();
