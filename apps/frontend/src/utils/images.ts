import { library } from '@beabee/vue/plugins/icons';

import { type IconName, icon } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

/**
 * Generate a unique ID for an icon image based on its name and color
 *
 * @param iconName The name of the icon
 * @param color The color of the icon
 * @returns A unique ID for the icon
 */
export function generateImageId(iconName: string, color: string): string {
  return `icon-${iconName}-${color}`;
}

/**
 * Convert an SVG string to a PNG data URL
 *
 * @param svgString The SVG string to convert
 * @returns A promise that resolves to the PNG data URL
 */
export function svgToImage(svgString: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');
        resolve(pngDataUrl);
      } else {
        reject(new Error('Failed to get canvas context'));
      }
      URL.revokeObjectURL(url);
    };

    img.onerror = (error) => reject(error);
    img.src = url;
  });
}

/**
 * Get the SVG string for a FontAwesome icon with a specific color
 *
 * @param iconName The name of the icon
 * @param color The color to use for the icon
 * @returns The SVG string for the icon
 */
export function getImageString(iconName: string, color: string): string {
  const iconObject = icon({ prefix: 'fas', iconName: iconName as IconName });

  const svgPath = iconObject.icon[4] as string;
  const width = iconObject.icon[0] as number;
  const height = iconObject.icon[1] as number;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const scale = 0.05;
  svg.setAttribute('width', (width * scale).toString());
  svg.setAttribute('height', (height * scale).toString());
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', svgPath);
  path.setAttribute('fill', color);

  svg.appendChild(path);

  return new XMLSerializer().serializeToString(svg);
}
