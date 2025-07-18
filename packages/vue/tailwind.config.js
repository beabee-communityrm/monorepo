import { resolve } from 'import-meta-resolve';
import { fileURLToPath } from 'url';

const vuePkgComponentPath = fileURLToPath(
  resolve('@beabee/vue/components-path', import.meta.url)
);

function shades(color, levels = []) {
  return Object.assign(
    { DEFAULT: `rgba(var(--c-${color}), <alpha-value>)` },
    ...levels.map((level) => ({
      [level]: `rgba(var(--c-${color}-${level}), <alpha-value>)`,
    }))
  );
}

const config = {
  // Default content parsing for the frontend app inkluding @beabee/vue components
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './.histoire/**/*.{vue,js,ts,jsx,tsx}',
    './histoire.setup.ts',
    `${vuePkgComponentPath}/**/*`,
  ],
  safelist: ['bg-success', 'bg-warning', 'bg-danger'],
  theme: {
    colors: {
      primary: shades('primary', [5, 10, 20, 40, 70, 80]),
      body: shades('body', [60, 80]),
      link: shades('link', [10, 30, 70, 110]),
      warning: shades('warning', [10, 30, 70, 110]),
      success: shades('success', [10, 30, 70, 110]),
      danger: shades('danger', [10, 30, 70, 110]),
      white: shades('white'),
      black: shades('black'),
      grey: {
        lighter: '#eee',
        light: '#c7c7c7',
        DEFAULT: '#a4a4a4',
        dark: '#5f5f5f',
        darker: '#434343',
      },
    },
    fontFamily: {
      body: 'var(--ff-body)',
      title: 'var(--ff-title)',
    },
    extend: {
      borderRadius: {
        DEFAULT: '3px',
      },
      lineHeight: {
        5.5: '1.375rem',
      },
      screens: {
        xs: '475px',
        lg: '1264px' /* Offset by 240px for menu */,
        xl: '1640px',
      },
      padding: {
        4.5: '1.125rem',
      },
      spacing: {
        menu: '240px',
      },
      height: {
        7.5: '1.875rem',
      },
      boxShadow: {
        DEFAULT: '0 0 8px 0 rgba(0, 0, 0, 0.2)',
        input: '0 0 0 0.125rem rgba(var(--c-link), 0.25)',
        'auth-box': '0 0 1rem 0.125rem rgba(51, 51, 51, 0.4)',
      },
      fontSize: {
        '1.8xl': '1.375rem',
        '2.2xl': '1.625rem',
        '3.5xl': '2rem',
      },
      transitionProperty: {
        width: 'width',
      },
    },
  },
  plugins: [],
};

export default config;
