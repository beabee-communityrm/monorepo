import '@beabee/vue/lib/theme';

import '@iframe-resizer/child';

import './index.css';
import { initializeApp } from './lib/bootstrap';
import { initializeTheme } from './lib/theme';

// Initialize theme system
initializeTheme();

// Start the initialization process
initializeApp();
