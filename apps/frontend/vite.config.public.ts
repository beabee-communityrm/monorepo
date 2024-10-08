import { Plugin, defineConfig } from 'vite';

export default () => {
  const plugins: Plugin[] = [];

  return defineConfig({
    clearScreen: false,
    build: {
      sourcemap: true,
      rollupOptions: {
        input: ['public/embed.ts'],
        output: {
          format: 'iife',
          entryFileNames: '[name].js',
        },
      },
      emptyOutDir: false,
    },
    plugins,
  });
};
