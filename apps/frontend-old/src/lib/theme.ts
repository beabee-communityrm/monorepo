import { setTheme } from '@beabee/vue/lib/theme';

import { watch } from 'vue';

import { generalContent } from '../store/generalContent';

/**
 * Initialize and sync theme with the Vue design system
 * This connects the frontend's generalContent theme with the Vue package theme system
 */
export function initializeTheme() {
  // Watch for theme changes in generalContent and sync with Vue design system
  watch(
    () => generalContent.value.theme,
    (newTheme) => {
      if (newTheme) {
        setTheme(newTheme);
      }
    },
    {
      deep: true,
      immediate: true, // Apply theme immediately on initialization
    }
  );
}
