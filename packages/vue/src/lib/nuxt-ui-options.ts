export const nuxtUiOptions = {
  theme: {
    colors: ['primary', 'link', 'danger'] as string[],
  },
  ui: {
    button: {
      slots: {
        base: 'rounded',
      },
      variants: {
        size: {
          xs: { base: 'text-sm' },
          sm: { base: 'text-sm' },
        },
      },
    },
  },
};
