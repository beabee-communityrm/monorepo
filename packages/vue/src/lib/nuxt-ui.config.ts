import type { NuxtUIOptions } from '@nuxt/ui/vite';

/**
 * Shared Nuxt UI configuration for both apps/frontend and packages/vue.
 * Colours here affect all Nuxt UI components across the app and Histoire stories.
 */
export const nuxtUiConfig: NuxtUIOptions = {
  ui: {
    colors: {
      primary: 'nuxt-primary',
      neutral: 'gray',
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
        // `nuxt-page` applies the page-level typography rules (index.css)
        // to modal content, since it's teleported outside `.nuxt-page`.
        // Nuxt UI's divide-y also borders every child except the last
        // (header and body both get a bottom border), which draws an
        // unwanted line between the body and footer. Cancel it and restore
        // just the header/body divider explicitly.
        content: 'nuxt-page divide-y-0',
        header: 'border-b border-default',
      },
    },
    button: {
      slots: {
        // Nuxt UI's own default omits justify-center, so content packs to
        // the left on stretched (block/w-full/flex-1) buttons.
        base: 'cursor-pointer justify-center',
      },
      compoundVariants: [
        {
          square: false,
          // Exclude 'link' — it's styled as inline text, not a boxed button,
          // so it shouldn't get the same vertical padding as the rest.
          variant: ['solid', 'outline', 'soft', 'subtle', 'ghost'],
          class: 'py-2.5!',
        },
      ],
    },
  },
};
