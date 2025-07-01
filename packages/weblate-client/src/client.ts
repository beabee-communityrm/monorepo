import createClient from 'openapi-fetch';

import type {
  TranslationUnitResponseData,
  UnitUpdateRequestBody,
  WeblateClientOptions,
  paths,
} from './types/index.ts';

/**
 * Weblate API client
 * @param options Configuration options for the client
 */
export class WeblateClient {
  readonly raw: ReturnType<typeof createClient<paths>>;

  readonly options: WeblateClientOptions;

  constructor(options: WeblateClientOptions) {
    this.options = options;
    this.raw = createClient<paths>({
      baseUrl: options.baseUrl,
      headers: {
        Authorization: `Token ${options.token}`,
      },
    });
  }

  // Handwritten wrapper methods for a cleaner API

  /**
   * Fetches all translation units for the configured project and component
   * @returns The list of translation units
   */
  async getUnits() {
    const response = await this.raw.GET('/units/');

    if (response.error) {
      throw new Error(
        `Failed to fetch units: ${JSON.stringify(response.error)}`
      );
    }

    return response.data;
  }

  /**
   * Retrieves a specific translation unit by ID
   * @param unitId The ID of the unit to retrieve
   * @returns The unit data
   */
  async getUnit(unitId: number) {
    const response = await this.raw.GET('/units/{id}/', {
      params: {
        path: {
          id: unitId.toString(),
        },
      },
    });

    if (response.error) {
      throw new Error(
        `Failed to fetch unit: ${JSON.stringify(response.error)}`
      );
    }

    return response.data;
  }

  async getTranslationUnits(query: {
    component: string;
    project: string;
    language: string;
    q?: string;
  }): Promise<TranslationUnitResponseData> {
    const response = await this.raw.GET(
      '/translations/{component__project__slug}/{component__slug}/{language__code}/units/',
      {
        params: {
          path: {
            component__project__slug: query.project,
            component__slug: query.component,
            language__code: query.language,
          },
          query: {
            // @ts-ignore
            q: query.q,
          },
        },
      }
    );

    if (response.error) {
      throw new Error(
        `Failed to fetch translation units: ${JSON.stringify(response.error)}`
      );
    }

    return response.data as TranslationUnitResponseData; // Generated type has no `results` field
  }

  /**
   * Updates the labels/tags for a specific translation unit
   * @param unitId The ID of the unit to update
   * @param labelIds Array of label IDs to assign to the unit
   * @returns The updated unit data
   */
  async updateUnitLabels(unitId: number, labelIds: number[]) {
    // Directly use the array of label IDs in the request body.
    // The Weblate API likely expects an array of numbers (label IDs)
    // for this field when patching a unit, despite what the generated type might suggest.
    // The runtime error "int() argument must be ... not 'dict'" is a strong indicator.
    const body: UnitUpdateRequestBody = {
      labels: labelIds as any, // Use type assertion to satisfy TS while sending number[]
    };

    const response = await this.raw.PATCH('/units/{id}/', {
      params: {
        path: {
          id: unitId.toString(),
        },
      },
      body,
    });

    if (response.error) {
      throw new Error(
        `Failed to update unit labels: ${JSON.stringify(response.error)}`
      );
    }

    return response.data;
  }

  /**
   * Updates a translation unit
   * @param unitId The ID of the unit to update
   * @param data The data to update on the unit
   * @returns The updated unit data
   */
  async updateUnit(unitId: number, data: UnitUpdateRequestBody) {
    const response = await this.raw.PATCH('/units/{id}/', {
      params: {
        path: {
          id: unitId.toString(),
        },
      },
      body: data,
    });

    if (response.error) {
      throw new Error(
        `Failed to update unit: ${JSON.stringify(response.error)}`
      );
    }

    return response.data;
  }

  /**
   * Get all translations for a specific project and component
   * @returns List of translations
   */
  async getTranslations() {
    const response = await this.raw.GET(
      '/components/{project__slug}/{slug}/translations/',
      {
        params: {
          path: {
            project__slug: this.options.project,
            slug: this.options.component,
          },
        },
      }
    );

    if (response.error) {
      throw new Error(
        `Failed to fetch translations: ${JSON.stringify(response.error)}`
      );
    }

    return response.data;
  }

  async getTranslationsForLanguage(language: string) {
    const response = await this.raw.GET(
      '/translations/{component__project__slug}/{component__slug}/{language__code}/',
      {
        params: {
          path: {
            component__project__slug: this.options.project,
            component__slug: this.options.component,
            language__code: language,
          },
        },
      }
    );

    if (response.error) {
      throw new Error(
        `Failed to fetch translations: ${JSON.stringify(response.error)}`
      );
    }

    return response.data;
  }

  /**
   * Get statistics for the component
   * @returns Component statistics
   */
  async getComponentStatistics() {
    const response = await this.raw.GET(
      '/components/{project__slug}/{slug}/statistics/',
      {
        params: {
          path: {
            project__slug: this.options.project,
            slug: this.options.component,
          },
        },
      }
    );

    if (response.error) {
      throw new Error(
        `Failed to fetch component statistics: ${JSON.stringify(response.error)}`
      );
    }

    return response.data;
  }
}
