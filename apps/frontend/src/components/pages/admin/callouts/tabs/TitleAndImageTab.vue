<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <!-- Status Notifications would go here if needed -->

    <div class="flex min-h-0 gap-4">
      <!-- Left Sidebar with Scroll Navigation -->
      <AppScrollNavigation
        :sections="navigationSections"
        @section-change="onSectionChange"
      />

      <!-- Main Content -->
      <div
        ref="contentRef"
        class="relative max-w-3xl flex-1 overflow-y-auto"
        style="contain: paint"
      >
        <AppHeading class="text-xl !text-body">
          {{ t('createCallout.tabs.titleAndImage.title') }}
        </AppHeading>

        <!-- General Section -->
        <AppScrollSection id="general" @mounted="registerSection">
          <AppFormBox :title="inputT('general.title')">
            <AppFormField :help="inputT('title.help')">
              <AppInput
                v-model="titleDefault"
                :label="inputT('title.label')"
                :placeholder="inputT('title.placeholder')"
                required
              />
              <p class="mt-1 text-sm text-body-60">
                {{ t('common.translationsInTranslationsTab') }}
              </p>
            </AppFormField>

            <AppFormField :help="inputT('description.help')">
              <AppTextArea
                v-model="descriptionDefault"
                :label="inputT('description.label')"
                :placeholder="inputT('description.placeholder')"
                required
              />
              <p class="mt-1 text-sm text-body-60">
                {{ t('common.translationsInTranslationsTab') }}
              </p>
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
        <AppScrollSection id="url" @mounted="registerSection">
          <AppFormBox
            :title="inputT('slug.boxTitle')"
            :notification="
              !canEditSlug
                ? {
                    title: t(
                      'createCallout.tabs.titleAndImage.inputs.slug.locked.title'
                    ),
                    description: t(
                      'createCallout.tabs.titleAndImage.inputs.slug.locked.description'
                    ),
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
                :description="
                  data.autoGenerateSlug
                    ? inputT('slug.opts.auto')
                    : inputT('slug.opts.manual')
                "
                :disabled="!canEditSlug"
                required
              />
              <AppInput
                v-if="data.autoGenerateSlug"
                :model-value="env.appUrl + '/callouts/' + slug"
                :disabled="true"
                :copyable="true"
                required
              />
              <AppInput
                v-else
                v-model="customSlug"
                :disabled="!canEditSlug"
                :prefix="env.appUrl + '/callouts/'"
                :copyable="true"
                required
              />
            </AppFormField>
          </AppFormBox>
        </AppScrollSection>

        <!-- Sharing Settings Section -->
        <AppScrollSection id="sharing" @mounted="registerSection">
          <AppFormBox :title="inputT('sharing.title')">
            <AppFormField>
              <AppToggleField
                v-model="data.overrideShare"
                :variant="'link'"
                :label="inputT('overrideShare.label')"
                :description="inputT('overrideShare.description')"
              />
            </AppFormField>

            <AppFormField :help="inputT('shareTitle.help')">
              <AppInput
                v-model="shareTitleDefault"
                :label="inputT('shareTitle.label')"
                :placeholder="inputT('shareTitle.placeholder')"
                :disabled="!data.overrideShare"
                required
              />
              <p v-if="data.overrideShare" class="mt-1 text-sm text-body-60">
                {{ t('common.translationsInTranslationsTab') }}
              </p>
            </AppFormField>

            <AppFormField :help="inputT('shareDescription.help')">
              <AppTextArea
                v-model="shareDescriptionDefault"
                :label="inputT('shareDescription.label')"
                :placeholder="inputT('shareDescription.placeholder')"
                :disabled="!data.overrideShare"
                required
              />
              <p v-if="data.overrideShare" class="mt-1 text-sm text-body-60">
                {{ t('common.translationsInTranslationsTab') }}
              </p>
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
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppInput from '@components/forms/AppInput.vue';
import AppImageUpload from '@components/forms/AppImageUpload.vue';
import useVuelidate from '@vuelidate/core';
import env from '@env';
import slugify from 'slugify';
import AppFormBox from '@beabee/vue/components/form/AppFormBox';
import AppTextArea from '@components/forms/AppTextArea.vue';
import AppToggleField from '@beabee/vue/components/form/AppToggleField';
import AppFormField from '@beabee/vue/components/form/AppFormField';
import AppHeading from '@components/AppHeading.vue';
import type { LocaleProp } from '@type';
import type { CalloutHorizontalTabs } from '../CalloutHorizontalTabs.interface';
import {
  AppScrollNavigation,
  AppScrollSection,
  type ScrollSection,
} from '@beabee/vue/components';

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
  t('createCallout.tabs.titleAndImage.inputs.' + key);

// Reference to content container
const contentRef = ref<HTMLElement | null>(null);

// Sections for scroll navigation
const sections = ref<ScrollSection[]>([
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

// Computed sections for navigation
const navigationSections = computed(() => sections.value);

// Register a section element for scrolling
function registerSection(id: string, element: HTMLElement): void {
  const sectionIndex = sections.value.findIndex((s) => s.id === id);
  if (sectionIndex >= 0) {
    sections.value[sectionIndex].element = element;
  }
}

// Handle section change from navigation
function onSectionChange(): void {
  // This function can be used to perform additional actions when a section is selected
  // For now, we just rely on the ScrollNavigation component to handle scrolling
}

const slug = computed(() =>
  props.data.autoGenerateSlug ? props.data.autoSlug : customSlug.value
);

const customSlug = computed({
  get: () => props.data.slug || props.data.autoSlug,
  // eslint-disable-next-line vue/no-mutating-props
  set: (newSlug) => (props.data.slug = slugify(newSlug)),
});

// Computed properties for default values of localized fields
const titleDefault = computed({
  get: () => props.data.title.default || '',
  set: (value) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.data.title = { ...props.data.title, default: value };
  },
});

const descriptionDefault = computed({
  get: () => props.data.description.default || '',
  set: (value) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.data.description = { ...props.data.description, default: value };
  },
});

// Computed properties for share fields that sync with title/description when not overridden
const shareTitle = computed({
  get: () =>
    props.data.overrideShare ? props.data.shareTitle : props.data.title,
  set: (value) => {
    if (props.data.overrideShare) {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.shareTitle = value;
    }
  },
});

const shareTitleDefault = computed({
  get: () => shareTitle.value.default || '',
  set: (value) => {
    const newShareTitle = { ...shareTitle.value, default: value };
    if (props.data.overrideShare) {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.shareTitle = newShareTitle;
    } else {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.title = newShareTitle;
    }
  },
});

const shareDescription = computed({
  get: () =>
    props.data.overrideShare
      ? props.data.shareDescription
      : props.data.description,
  set: (value) => {
    if (props.data.overrideShare) {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.shareDescription = value;
    }
  },
});

const shareDescriptionDefault = computed({
  get: () => shareDescription.value.default || '',
  set: (value) => {
    const newShareDescription = { ...shareDescription.value, default: value };
    if (props.data.overrideShare) {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.shareDescription = newShareDescription;
    } else {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.description = newShareDescription;
    }
  },
});

// Watch for changes in title/description and update share fields when not overridden
watch(
  () => props.data.title,
  (newTitle) => {
    if (!props.data.overrideShare) {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.shareTitle = newTitle;
    }
  }
);

watch(
  () => props.data.description,
  (newDescription) => {
    if (!props.data.overrideShare) {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.shareDescription = newDescription;
    }
  }
);

watch(
  () => props.data.title,
  (title) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.data.autoSlug = slugify(title.default, { lower: true });
  }
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
