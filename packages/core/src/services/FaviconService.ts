import config from '../config/config';
import { BadRequestError, NotFoundError } from '../errors';
import { log as mainLogger } from '../logging';
import { imageService } from './ImageService';
import { optionsService } from './OptionsService';

const log = mainLogger.child({ app: 'favicon-service' });

/**
 * Service for generating favicons and web app manifest from the organization logo
 */
export class FaviconService {
  // Standard favicon sizes that we support
  private static readonly FAVICON_SIZES = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180, // Apple touch icon is 180x180
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
  } as const;

  /**
   * Get a favicon image in PNG format
   * @param filename The favicon filename (e.g., 'favicon-16x16.png')
   * @returns Image buffer and content type
   */
  async getFaviconImage(
    filename: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const size =
      FaviconService.FAVICON_SIZES[
        filename as keyof typeof FaviconService.FAVICON_SIZES
      ];

    if (!size) {
      throw new BadRequestError({
        message: `Unsupported favicon size: ${filename}`,
      });
    }

    const logoUrl = optionsService.getText('logo');
    if (!logoUrl) {
      throw new NotFoundError({ message: 'No logo configured' });
    }

    try {
      // Extract the image ID from the logo URL
      const imageId = this.extractImageIdFromUrl(logoUrl);

      // Get the favicon-sized image from ImageService
      const imageData = await imageService.getImageBuffer(imageId, size);

      // Force PNG format for favicons
      return {
        buffer: imageData.buffer,
        contentType: 'image/png',
      };
    } catch (error) {
      log.error(`Failed to generate favicon ${filename}:`, error);
      throw new NotFoundError({
        message: `Failed to generate favicon: ${filename}`,
      });
    }
  }

  /**
   * Get a favicon.ico file (converts PNG to ICO format)
   * @returns ICO buffer and content type
   */
  async getFaviconIco(): Promise<{ buffer: Buffer; contentType: string }> {
    // For now, we'll return the 32x32 PNG as ICO
    // In the future, we could use a library like 'ico-endec' to create proper ICO files
    const pngData = await this.getFaviconImage('favicon-32x32.png');

    return {
      buffer: pngData.buffer,
      contentType: 'image/x-icon',
    };
  }

  /**
   * Generate the web app manifest (site.webmanifest)
   * @returns Web app manifest as JSON
   */
  async getWebAppManifest(): Promise<object> {
    const organizationName = optionsService.getText('organisation');

    // Get theme colors from the theme option
    let themeColor = '#ffffff';
    let backgroundColor = '#ffffff';

    try {
      const theme = optionsService.getJSON('theme');
      if (theme && theme.colors) {
        // Use primary color as theme color, white as background
        themeColor = theme.colors.primary || '#ffffff';
        backgroundColor = theme.colors.white || '#ffffff';
      }
    } catch (error) {
      // If theme parsing fails, use defaults
      log.warn('Failed to parse theme for manifest, using defaults:', error);
    }

    // Generate icon URLs
    const baseUrl = config.audience;
    const icons = [
      {
        src: `${baseUrl}/android-chrome-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `${baseUrl}/android-chrome-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
    ];

    return {
      name: organizationName || '',
      short_name: organizationName || '',
      icons,
      theme_color: themeColor,
      background_color: backgroundColor,
      display: 'standalone',
    };
  }

  /**
   * Extract image ID from a logo URL
   * @param logoUrl The logo URL (e.g., 'images/abc123' or 'https://example.com/api/1.0/images/abc123')
   * @returns The image ID
   */
  private extractImageIdFromUrl(logoUrl: string): string {
    // Handle relative URLs like 'images/abc123'
    if (logoUrl.startsWith('images/')) {
      return logoUrl.replace('images/', '');
    }

    // Handle absolute URLs like 'https://example.com/api/1.0/images/abc123'
    const match = logoUrl.match(/\/images\/([^/?]+)/);
    if (match) {
      return match[1];
    }

    // If it's an old format URL, we can't handle it
    throw new BadRequestError({
      message:
        'Unable to extract image ID from logo URL. Please ensure the logo has been migrated.',
    });
  }

  /**
   * Check if the favicon service is available (logo is configured and migrated)
   * @returns True if favicons can be generated
   */
  async isAvailable(): Promise<boolean> {
    try {
      const logoUrl = optionsService.getText('logo');
      if (!logoUrl) {
        return false;
      }

      const imageId = this.extractImageIdFromUrl(logoUrl);
      return await imageService.imageExists(imageId);
    } catch (error) {
      return false;
    }
  }
}

export const faviconService = new FaviconService();
