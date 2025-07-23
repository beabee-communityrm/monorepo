/**
 * Essential FontAwesome utility functions for icon picker
 *
 * Contains only the utility functions that are essential for basic icon picker functionality.
 */
import { FONTAWESOME_ICONS } from '../data/icons';
import type { FontAwesome } from '../types';

/**
 * Get all available styles across all icons
 */
export function getAvailableStyles(): string[] {
  const styles = new Set<string>();

  for (const icon of FONTAWESOME_ICONS) {
    for (const style of icon.styles) {
      styles.add(style);
    }
  }

  return Array.from(styles).sort();
}

/**
 * Generate icon CSS class name for FontAwesome
 */
export function generateIconClassName(
  iconName: string,
  style: string = 'solid'
): string {
  const stylePrefix = getStylePrefix(style);
  return `${stylePrefix} fa-${iconName}`;
}

/**
 * Get FontAwesome style prefix
 */
export function getStylePrefix(style: string): string {
  const stylePrefixes: Record<string, string> = {
    solid: 'fas',
    regular: 'far',
    light: 'fal',
    duotone: 'fad',
    brands: 'fab',
    thin: 'fat',
  };

  return stylePrefixes[style] || 'fas';
}

/**
 * Check if an icon supports a specific style
 */
export function iconSupportsStyle(iconName: string, style: string): boolean {
  const icon = FONTAWESOME_ICONS.find((i) => i.name === iconName);
  return icon?.styles.includes(style) || false;
}

/**
 * Get icon Unicode character
 */
export function getIconUnicode(iconName: string): string | undefined {
  const icon = FONTAWESOME_ICONS.find((i) => i.name === iconName);
  return icon?.unicode;
}

/**
 * Format icon for display in UI components
 */
export function formatIconForDisplay(icon: FontAwesome) {
  return {
    name: icon.name,
    label: icon.label,
    displayName: icon.label || icon.name,
    primaryStyle: icon.styles[0],
    availableStyles: icon.styles,
    categories: icon.categories,
    className: generateIconClassName(icon.name, icon.styles[0]),
  };
}
