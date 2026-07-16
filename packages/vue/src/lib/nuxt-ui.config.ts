import type { NuxtUIOptions } from '@nuxt/ui/vite';

/**
 * Shared Nuxt UI configuration for both apps/frontend and packages/vue.
 * Colours here affect all Nuxt UI components across the app and Histoire stories.
 */
export const nuxtUiConfig: NuxtUIOptions = {
  ui: {
    colors: {
      primary: 'nuxt-primary',
      neutral: 'nuxt-neutral',
    },
    navigationMenu: {
      slots: {
        link: 'py-2.5!',
        linkLeadingIcon: 'size-4.5!',
      },
      variants: {
        active: {
          false: {
            linkLeadingIcon: 'text-muted group-hover:text-highlighted',
          },
        },
      },
    },
    formField: {
      slots: {
        help: 'text-xs',
      },
      variants: {
        required: {
          true: {
            label: 'after:text-primary!',
          },
        },
      },
    },
    input: {
      slots: {
        base: 'py-2.5!',
      },
    },
    modal: {
      slots: {
        content: 'text-default',
        body: 'text-sm',
      },
    },
    button: {
      slots: {
        base: 'cursor-pointer',
      },
      compoundVariants: [
        {
          square: false,
          class: 'py-2.5!',
        },
      ],
    },
  },
};
