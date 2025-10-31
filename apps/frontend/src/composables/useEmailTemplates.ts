import {
  type EmailTemplateMetadata,
  EmailTemplateType,
} from '@beabee/beabee-common';
import type { MergeTagGroup } from '@beabee/vue';

import { computed, ref } from 'vue';

import { client } from '../utils/api';

/**
 * Composable for working with email template metadata
 * Provides information about available templates, their types, and merge fields
 */
export function useEmailTemplates() {
  const templates = ref<EmailTemplateMetadata[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * Load template metadata from the backend
   */
  async function loadTemplates() {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await client.email.getTemplatesMetadata();
      templates.value = response.templates;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get template metadata by ID
   */
  function getTemplate(templateId: string): EmailTemplateMetadata | undefined {
    return templates.value.find((t) => t.id === templateId);
  }

  /**
   * Get all templates of a specific type
   */
  function getTemplatesByType(
    type: EmailTemplateType
  ): EmailTemplateMetadata[] {
    return templates.value.filter((t) => t.type === type);
  }

  /**
   * Check if a template ID is a system template
   */
  function isSystemTemplate(templateId: string): boolean {
    return templates.value.some((t) => t.id === templateId);
  }

  /**
   * Get the template type for a given template ID
   */
  function getTemplateType(templateId: string): EmailTemplateType | undefined {
    return getTemplate(templateId)?.type;
  }

  /**
   * Get merge fields for a template
   * Returns an empty array if template is not found
   */
  function getMergeFields(templateId: string): string[] {
    return getTemplate(templateId)?.mergeFields || [];
  }

  /**
   * Get merge field groups for EmailEditor component
   * Formats merge fields as expected by the EmailEditor
   */
  function getMergeFieldGroups(templateId: string): MergeTagGroup[] {
    const template = getTemplate(templateId);
    if (!template) return [];

    // Group merge fields by category
    const groups: Record<string, Array<{ tag: string; example?: string }>> = {};

    // Contact fields
    const contactFields = ['EMAIL', 'NAME', 'FNAME', 'LNAME'];
    const contactMergeFields = template.mergeFields.filter((field: string) =>
      contactFields.includes(field)
    );
    if (contactMergeFields.length > 0) {
      groups['Contact'] = contactMergeFields.map((field: string) => ({
        tag: field,
      }));
    }

    // Template-specific fields
    const templateSpecificFields = template.mergeFields.filter(
      (field: string) => !contactFields.includes(field)
    );
    if (templateSpecificFields.length > 0) {
      groups[template.name] = templateSpecificFields.map((field: string) => ({
        tag: field,
      }));
    }

    return Object.entries(groups).map(([name, tags]) => ({
      key: name.toLowerCase().replace(/\s+/g, '-'),
      labelKey: `mergeFields.groups.${name.toLowerCase()}`,
      tags,
    }));
  }

  // Computed properties
  const generalTemplates = computed(() =>
    getTemplatesByType(EmailTemplateType.General)
  );
  const adminTemplates = computed(() =>
    getTemplatesByType(EmailTemplateType.Admin)
  );
  const contactTemplates = computed(() =>
    getTemplatesByType(EmailTemplateType.Contact)
  );

  return {
    // State
    templates,
    loading,
    error,

    // Computed
    generalTemplates,
    adminTemplates,
    contactTemplates,

    // Methods
    loadTemplates,
    getTemplate,
    getTemplatesByType,
    isSystemTemplate,
    getTemplateType,
    getMergeFields,
    getMergeFieldGroups,
  };
}
