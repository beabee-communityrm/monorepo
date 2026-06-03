<template>
  <UButton
    ref="buttonRef"
    :color="color"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :type="type"
    :to="to"
    :href="href"
    :external="external"
    :as="as"
    :leading-icon="icon"
    :aria-label="accessibleLabel"
    :aria-busy="loading || undefined"
    v-bind="$attrs"
    ><slot /><template v-if="$slots.trailing" #trailing
      ><slot name="trailing" /></template
  ></UButton>
</template>

<script lang="ts" setup>
import type { ButtonProps } from '@nuxt/ui/runtime/components/Button.vue';
import { computed, ref } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

export type ButtonColor = 'primary' | 'link' | 'danger' | 'neutral';
export type ButtonVariant =
  | 'solid'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'soft'
  | 'subtle';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AppButtonProps {
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  to?: RouteLocationRaw;
  href?: string;
  external?: boolean;
  /** Render as a different element, e.g. "label" */
  as?: string;
  /** Iconify icon string, e.g. "fa6-solid:user" */
  icon?: string;
  /** Tooltip; also used as aria-label fallback */
  title?: string;
  /** Accessible label (overrides title for aria-label) */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<AppButtonProps>(), {
  color: 'primary',
  variant: 'solid',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  to: undefined,
  href: undefined,
  external: false,
  as: undefined,
  icon: undefined,
  title: undefined,
  ariaLabel: undefined,
});

const buttonRef = ref<{ $el: HTMLElement } | null>(null);

const accessibleLabel = computed(() => props.ariaLabel || props.title);

const focus = () => {
  buttonRef.value?.$el?.focus();
};

defineExpose({ focus, buttonRef });
</script>
