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
    primary: string;
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
  colors?: Partial<Theme['colors']>;
  fonts?: {
    title?: string;
    body?: string;
  };
};

export const colorPresets = [
  {
    name: 'default',
    colors: {
      primary: '#262453',
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
  'primary',
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
const TAILWIND_SHADE_LEVELS: [shade: number, level: number][] = [
  [50, 5],
  [100, 10],
  [200, 20],
  [300, 30],
  [400, 40],
  [500, 100],
  [600, 110],
  [700, 120],
  [800, 130],
  [900, 140],
  [950, 145],
];

function setShades(
  colorName: string,
  colorValue: string,
  levels: number[] = []
) {
  setColorVar(`--c-${colorName}`, colorValue);
  for (const level of levels) {
    setColorVar(`--c-${colorName}-${level}`, computeShade(colorValue, level));
  }

  if (colorName === 'primary') return; // Don't generate Nuxt shades for primary colour, as is a naming conflict
  // with Nuxt UI's primary colour, for which we are using the 'link' colour instead.

  // Set standard Tailwind 50–950 scale for Nuxt UI compatibility
  for (const [shade, level] of TAILWIND_SHADE_LEVELS) {
    const [r, g, b] = parseToRgba(computeShade(colorValue, level));

    setCSSVar(
      `--color-${colorName}-${shade}`,
      `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
    );
  }
}

export function getFullTheme(theme: PartialTheme): Theme {
  const primaryColor =
    theme.colors?.primary ?? defaultColorPreset.colors.primary;
  const bodyFont = getFont(theme.fonts?.body);

  const colors = {
    _name: theme.colors?._name ?? 'custom',
    primary: primaryColor,
    body: theme.colors?.body ?? primaryColor,
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
    setShades('primary', colors.primary, [5, 10, 20, 40, 70, 80]);
    setShades('body', colors.body, [60, 80]);
    // Nuxt UI's neutral scale expects a lighter base than our (often very dark)
    // body colour, so derive a lightened variant for it to use instead.
    setShades('nuxt-text', mix(colors.body, 'white', 0.35));
    setShades('link', colors.link, [10, 70, 110]);
    setShades('warning', colors.warning || '#f5cc5b', [10, 30, 70]);
    setShades('success', colors.success || '#86a960', [10, 30, 70, 110]);
    setShades('danger', colors.danger || '#ce3d3d', [10, 30, 70, 110]);
    setShades('white', colors.white || '#ffffff');
    setShades('black', colors.black || '#000000');

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
