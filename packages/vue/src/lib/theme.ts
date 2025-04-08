import { parseToRgba, mix } from 'color2k';
import { watch } from 'vue';
import { generalContent } from '@beabee/vue/store/generalContent';

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

function setShades(
  colorName: string,
  colorValue: string,
  levels: number[] = []
) {
  setColorVar(`--c-${colorName}`, colorValue);
  for (const level of levels) {
    const levelColor =
      level > 100
        ? mix(colorValue, 'black', level / 100 - 1)
        : mix(colorValue, 'white', 1 - level / 100);
    setColorVar(`--c-${colorName}-${level}`, levelColor);
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

watch(
  () => generalContent.value.theme,
  (newTheme) => {
    const { colors, fonts } = getFullTheme(newTheme);

    // Set colors

    setShades('primary', colors.primary, [5, 10, 20, 40, 70, 80]);
    setShades('body', colors.body, [60, 80]);
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
    immediate: true, // Initialise default theme on page load
  }
);
