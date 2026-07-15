import { mix, parseToRgba } from 'color2k';
import { ref, watch } from 'vue';

// [Font name, fallbacks]
export const validFonts = {
  'fira-sans': ['Fira Sans', 'sans-serif'],
  'fira-sans-condensed': ['Fira Sans Condensed', 'sans-serif'],
  'libre-franklin': ['Libre Franklin', 'sans-serif'],
  'nunito-sans': ['Nunito Sans', 'sans-serif'],
  'open-sans': ['Open Sans', 'sans-serif'],
  roboto: ['Roboto', 'sans-serif'],
  'roboto-slab': ['Roboto Slab', 'serif'],
  rubik: ['Rubik', 'sans-serif'],
  ubuntu: ['Ubuntu', 'sans-serif'],
  'work-sans': ['Work Sans', 'sans-serif'],
};

const allFonts = {
  ...validFonts,
  'helvetica-neue-lt': ['Helvetica Neue LT', 'sans-serif'],
  queue: ['Queue', 'sans-serif'],
};

type FontId = keyof typeof allFonts;

export type Theme = {
  colors: {
    _name: string;
    main: string;
    link: string;
    body: string;
    success: string;
    warning: string;
    danger: string;
    white: string;
    black: string;
  };
  fonts: {
    title: FontId;
    body: FontId;
  };
};

export type PartialTheme = {
  colors?: Partial<Theme['colors']> & {
    /** @deprecated use main */
    primary?: string;
  };
  fonts?: {
    title?: string;
    body?: string;
  };
};

export const colorPresets = [
  {
    name: 'default',
    colors: {
      main: '#262453',
      link: '#43a796',
      body: '#262453',
      warning: '#f5cc5b',
      success: '#86a960',
      danger: '#ce3d3d',
    },
  },
] as const;

const defaultColorPreset = colorPresets[0];

export const visibleCustomColors = [
  'main',
  'link',
  'body',
  'success',
  'warning',
  'danger',
] as const;

// Convert validFonts to a format suitable for select components
export const availableFonts = Object.entries(validFonts).map(
  ([id, [label]]) => ({
    id,
    label,
  })
);

// Internal reactive theme store
const currentTheme = ref<PartialTheme>({});

/**
 * Set the theme for the Vue design system
 * This function can be called from outside the package to update the theme
 */
export function setTheme(theme: PartialTheme) {
  currentTheme.value = theme;
}

/**
 * Get the current theme
 */
export function getCurrentTheme(): PartialTheme {
  return currentTheme.value;
}

function getFont(s: string | undefined): FontId {
  return s !== undefined && s in allFonts ? (s as FontId) : 'open-sans';
}

function setCSSVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function setColorVar(name: string, color: string) {
  const [r, g, b] = parseToRgba(color);
  setCSSVar(name, `${r}, ${g}, ${b}`);
}

function computeShade(colorValue: string, level: number): string {
  if (level === 100) return colorValue;
  return level > 100
    ? mix(colorValue, 'black', level / 100 - 1)
    : mix(colorValue, 'white', 1 - level / 100);
}

// Maps standard Tailwind shade numbers to the internal level system.
// Used to generate --color-{name}-{shade} variables for Nuxt UI compatibility.
// Levels calibrated against Nuxt UI's real neutral palettes (slate, gray,
// zinc, neutral, stone, mist, taupe, mauve, olive) so a custom neutral looks
// like those built-ins. Chromatic (non-neutral) base colours will still
// diverge noticeably, since a plain white/black mix can't reproduce the
// hue/chroma shifts Tailwind's hand-tuned scales use.
const TAILWIND_SHADE_LEVELS: [shade: number, level: number][] = [
  [50, 3.5],
  [100, 8.2],
  [200, 17.9],
  [300, 30.4],
  [400, 66],
  [500, 100],
  [600, 126.8],
  [700, 143.3],
  [800, 165.4],
  [900, 177.6],
  [950, 190.9],
];

function setCustomShades(
  colorName: string,
  colorValue: string,
  levels: number[] = []
) {
  setColorVar(`--c-${colorName}`, colorValue);
  for (const level of levels) {
    setColorVar(`--c-${colorName}-${level}`, computeShade(colorValue, level));
  }
}

// Set standard Tailwind 50–950 scale for a colour, for Nuxt UI compatibility.
// Only needed for the colours mapped to Nuxt UI tokens in nuxt-ui.config.ts,
// ('nuxt-primary' and 'nuxt-neutral').
function setNuxtShades(colorName: string, colorValue: string) {
  for (const [shade, level] of TAILWIND_SHADE_LEVELS) {
    const [r, g, b] = parseToRgba(computeShade(colorValue, level));

    setCSSVar(
      `--color-${colorName}-${shade}`,
      `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
    );
  }
}

export function getFullTheme(theme: PartialTheme): Theme {
  const mainColor =
    theme.colors?.main ??
    theme.colors?.primary ??
    defaultColorPreset.colors.main;
  const bodyFont = getFont(theme.fonts?.body);

  const colors = {
    _name: theme.colors?._name ?? 'custom',
    main: mainColor,
    body: theme.colors?.body ?? mainColor,
    link: theme.colors?.link ?? defaultColorPreset.colors.link,
    warning: theme.colors?.warning ?? defaultColorPreset.colors.warning,
    success: theme.colors?.success ?? defaultColorPreset.colors.success,
    danger: theme.colors?.danger ?? defaultColorPreset.colors.danger,
    white: theme.colors?.white ?? '#ffffff',
    black: theme.colors?.black ?? '#000000',
  } satisfies Theme['colors'];

  const fonts = {
    body: bodyFont,
    title: getFont(theme.fonts?.title ?? bodyFont),
  } satisfies Theme['fonts'];

  return { colors, fonts };
}

/**
 * Dynamically loads font CSS files as separate chunks.
 *
 * @param font - The font name to load
 * @returns A promise that resolves when the font CSS is loaded
 */
function loadFont(font: string) {
  return import(`../assets/styles/fonts-${font}.css`);
}

// Watch for theme changes and apply them
watch(
  currentTheme,
  (newTheme) => {
    const { colors, fonts } = getFullTheme(newTheme);

    // Set colors
    setCustomShades('main', colors.main, [5, 10, 20, 40, 70, 80]);
    setCustomShades('body', colors.body, [60, 80]);
    setCustomShades('link', colors.link, [10, 70, 110]);
    setCustomShades('warning', colors.warning || '#f5cc5b', [10, 30, 70]);
    setCustomShades('success', colors.success || '#86a960', [10, 30, 70, 110]);
    setCustomShades('danger', colors.danger || '#ce3d3d', [10, 30, 70, 110]);
    setCustomShades('white', colors.white || '#ffffff');
    setCustomShades('black', colors.black || '#000000');

    // Nuxt UI colour tokens (see nuxt-ui.config.ts): 'primary' uses the link
    // colour, 'neutral' expects a lighter base than our (often very dark)
    // body colour, so derive a lightened variant for it to use instead.
    setNuxtShades('nuxt-primary', colors.link);
    setNuxtShades('nuxt-neutral', mix(colors.body, 'white', 0.3));

    // Load fonts
    setCSSVar('--ff-body', allFonts[fonts.body].join(','));
    setCSSVar('--ff-title', allFonts[fonts.title].join(','));

    // Load the fonts using the single function
    loadFont(fonts.body);
    if (fonts.title !== fonts.body) {
      loadFont(fonts.title);
    }
  },
  {
    deep: true,
    immediate: true, // Initialize default theme on page load
  }
);
