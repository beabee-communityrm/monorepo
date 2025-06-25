<!--
  # AppNewsletterOptIn
  A newsletter opt-in component that allows users to subscribe to newsletters 
  with optional group selection. Provides flexible configuration for both 
  simple checkbox and multi-group selection modes.

  ## Features
  - Single opt-in checkbox mode when no groups are provided
  - Multi-group selection mode with individual group checkboxes
  - Automatic status synchronization between modes
  - Accessible markup with semantic HTML
  - Responsive design with mobile-first approach
  - Rich text content support
-->
<template>
  <section class="space-y-3 sm:space-y-2">
    <header class="mb-2">
      <h3 class="font-title text-xl font-semibold text-body">
        {{ title }}
      </h3>
    </header>

    <div
      v-if="text"
      :id="`${componentId}-description`"
      class="mb-4 max-w-none text-sm text-body-80"
      v-html="text"
    />

    <!-- Multi-group selection mode -->
    <AppCheckboxGroup
      v-if="groups.length > 0"
      v-model="optInGroups"
      :options="groups"
      :aria-label="groupsAriaLabel || 'Newsletter groups'"
      class="space-y-3"
    />

    <!-- Simple opt-in mode -->
    <AppCheckbox
      v-else
      v-model="optInStatus"
      :label="optIn"
      class="font-bold transition-colors"
      :aria-describedby="text ? ariaDescribedBy : undefined"
    />
  </section>
</template>

<script lang="ts" setup>
/**
 * Newsletter opt-in component for subscription management.
 * Supports both simple checkbox and multi-group selection modes.
 *
 * @component AppNewsletterOptIn
 */
import type { NewsletterGroupData } from '@beabee/beabee-common';

import { computed, watch } from 'vue';

import { useAriaDescribedBy } from '../../composables/useAccessibility';
import { generateComponentId } from '../../utils/ids';
import { AppCheckbox, AppCheckboxGroup } from '../form/index';

/**
 * Props for the AppNewsletterOptIn component
 */
export interface AppNewsletterOptInProps {
  /** The main title displayed above the opt-in options */
  title: string;
  /** Rich text content explaining the newsletter opt-in (supports HTML) */
  text: string;
  /** Label text for the simple opt-in checkbox (used when no groups) */
  optIn: string;
  /** Available newsletter groups for multi-selection */
  groups: NewsletterGroupData[];
  /** ARIA label for the groups selection (defaults to 'Newsletter groups') */
  groupsAriaLabel?: string;
}

const props = defineProps<AppNewsletterOptInProps>();

/**
 * Model values for the component
 */
const optInStatus = defineModel<boolean>({ default: false });
const optInGroups = defineModel<string[]>('optInGroups', {
  default: () => [],
});

// Generate unique ID for ARIA relationships
const componentId = computed(() => generateComponentId('AppNewsletterOptIn'));

// Use accessibility composable for aria-describedby
const { ariaDescribedBy } = useAriaDescribedBy({
  helpId: computed(() => `${componentId.value}-description`),
});

/**
 * Synchronize opt-in status with selected groups
 * When groups are selected, the main opt-in status should be true
 */
watch(
  optInGroups,
  (newGroups) => {
    optInStatus.value = newGroups.length > 0;
  },
  { immediate: true }
);
</script>
