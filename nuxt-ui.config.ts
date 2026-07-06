import type { NuxtUIOptions } from "@nuxt/ui/vite";

/**
 * Shared Nuxt UI configuration for both apps/frontend and packages/vue.
 * Colours here affect all Nuxt UI components across the app and Histoire stories.
 */
export const nuxtUiConfig: NuxtUIOptions = {
  ui: {
    colors: {
      primary: "link",
      neutral: "nuxt-text",
    },
    navigationMenu: {
      variants: {
        active: {
          false: {
            linkLeadingIcon: "text-muted group-hover:text-highlighted",
          },
        },
      },
    },
  },
};
