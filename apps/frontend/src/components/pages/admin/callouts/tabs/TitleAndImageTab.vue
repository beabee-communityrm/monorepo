<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <!-- Status Notifications would go here if needed -->

    <div class="flex min-h-0 gap-4">
      <!-- Left Sidebar with Scroll Navigation -->
      <AppScrollNavigation :sections="sections" />

      <!-- Main Content -->
      <div
        ref="contentRef"
        class="relative max-w-3xl flex-1 overflow-y-auto"
        style="contain: paint"
      >
        <!-- General Section -->
        <AppScrollSection id="general">
          <AppFormBox :title="inputT('general.title')">
            <AppFormField>
              <AppInput
                v-model="data.title.default"
                :label="inputT('title.label')"
                :placeholder="inputT('title.placeholder')"
                required
              />
            </AppFormField>

            <AppFormField :help="inputT('description.help')">
              <AppTextArea
                v-model="data.description.default"
                :label="inputT('description.label')"
                :placeholder="inputT('description.placeholder')"
                name="description"
                required
              />
            </AppFormField>

            <AppFormField :help="inputT('image.help')">
              <AppImageUpload
                v-model="data.coverImageURL"
                :label="inputT('image.label')"
                :description="inputT('image.description')"
                :width="1440"
                :height="900"
                required
              />
            </AppFormField>
          </AppFormBox>
        </AppScrollSection>

        <!-- URL & Slug Section -->
        <AppScrollSection id="url">
          <AppFormBox
            :title="inputT('slug.boxTitle')"
            :notification="
              !canEditSlug
                ? {
                    title: inputT('slug.locked.title'),
                    description: inputT('slug.locked.description'),
                    variant: 'warning',
                    mode: 'inline',
                    removeable: false,
                  }
                : undefined
            "
          >
            <AppFormField :help="inputT('slug.help')">
              <AppToggleField
                v-model="data.autoGenerateSlug"
                :variant="'link'"
                :label="inputT('slug.label')"
                :enabled-description="inputT('slug.opts.auto')"
                :disabled-description="inputT('slug.opts.manual')"
                :disabled="!canEditSlug"
              />
              <AppInput
                v-if="data.autoGenerateSlug"
                :model-value="env.appUrl + '/crowdnewsroom/' + data.autoSlug"
                :disabled="true"
                :copyable="true"
                required
              />
              <AppInput
                v-else
                v-model="props.data.slug"
                :disabled="!canEditSlug"
                :prefix="env.appUrl + '/crowdnewsroom/'"
                :copyable="true"
                required
              />
            </AppFormField>
          </AppFormBox>
        </AppScrollSection>

        <!-- Sharing Settings Section -->
        <AppScrollSection id="sharing">
          <AppFormBox :title="inputT('sharing.title')">
            <AppFormField>
              <AppToggleField
                v-model="data.overrideShare"
                :variant="'link'"
                :label="inputT('overrideShare.label')"
                :enabled-description="inputT('overrideShare.opts.enabled')"
                :disabled-description="inputT('overrideShare.opts.disabled')"
              />
            </AppFormField>

            <AppFormField :help="inputT('shareTitle.help')">
              <AppInput
                v-model="data.shareTitle.default"
                :label="inputT('shareTitle.label')"
                :placeholder="inputT('shareTitle.placeholder')"
                :disabled="!data.overrideShare"
                :required="data.overrideShare"
              />
            </AppFormField>

            <AppFormField :help="inputT('shareDescription.help')">
              <AppTextArea
                v-model="data.shareDescription.default"
                :label="inputT('shareDescription.label')"
                :placeholder="inputT('shareDescription.placeholder')"
                :maxlength="200"
                name="shareDescription"
                :disabled="!data.overrideShare"
                :required="data.overrideShare"
              />
            </AppFormField>
          </AppFormBox>
        </AppScrollSection>
      </div>

      <!-- Right Sidebar -->
      <div class="flex-0 basis-[15rem] overflow-y-auto">
        <!-- Optional content for right sidebar -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import {
  AppFormBox,
  AppFormField,
  AppInput,
  AppScrollNavigation,
  AppScrollSection,
  AppTextArea,
  AppToggleField,
  type ScrollSection,
} from '@beabee/vue';

import useVuelidate from '@vuelidate/core';
import slugify from 'slugify';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppImageUpload from '#components/forms/AppImageUpload.vue';
import env from '#env';
import type { LocaleProp } from '#type';

import type { CalloutHorizontalTabs } from '../CalloutHorizontalTabs.interface';

/**
 * Data for the title and image tab
 */
export interface TitleAndImageTabData {
  /** The title of the callout */
  title: LocaleProp;
  /** The description of the callout */
  description: LocaleProp;
  /** The URL of the cover image */
  coverImageURL: string;
  /** The auto-generated slug of the callout */
  autoSlug: string;
  /** Whether to use a custom slug */
  autoGenerateSlug: boolean;
  /** The custom slug of the callout */
  slug: string;
  /** Whether to override the share title and description */
  overrideShare: boolean;
  /** The share title of the callout */
  shareTitle: LocaleProp;
  /** The share description of the callout */
  shareDescription: LocaleProp;
}

export interface TitleAndImageTabProps {
  data: TitleAndImageTabData;
  status: ItemStatus | undefined;
  isActive: boolean;
  tabs: CalloutHorizontalTabs;
}

const emit = defineEmits(['update:error', 'update:validated']);
const props = defineProps<TitleAndImageTabProps>();

const { t } = useI18n();
const inputT = (key: string) =>
  t('callout.builder.tabs.titleAndImage.inputs.' + key);

// Reference to content container
const contentRef = ref<HTMLElement | null>(null);

// Sections for scroll navigation
const sections = computed<ScrollSection[]>(() => [
  {
    id: 'general',
    label: inputT('general.title'),
  },
  {
    id: 'url',
    label: inputT('slug.boxTitle'),
  },
  {
    id: 'sharing',
    label: inputT('sharing.title'),
  },
]);

// Slug generation
watch(
  () => props.data.title.default,
  (title) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.data.autoSlug = slugify(title, { lower: true });
  },
  { immediate: true }
);

const canEditSlug = computed(
  () =>
    !props.status ||
    props.status === ItemStatus.Draft ||
    props.status === ItemStatus.Scheduled
);

const validation = useVuelidate();

watch(
  validation,
  () => {
    emit('update:error', validation.value.$errors.length > 0);
    emit('update:validated', !validation.value.$invalid);
  },
  { immediate: true }
);
</script>
