<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div
    class="flex max-h-full min-h-0 max-w-3xl flex-1 flex-col gap-4 overflow-y-auto"
  >
    <AppFormBox :title="inputT('general.title')">
      <AppFormField :help="inputT('title.help')">
        <LocaleInput
          v-model="data.title"
          :locales="locales"
          :label="inputT('title.label')"
          :placeholder="inputT('title.placeholder')"
          required
        />
      </AppFormField>

      <AppFormField :help="inputT('description.help')">
        <LocaleTextArea
          v-model="data.description"
          :locales="locales"
          :label="inputT('description.label')"
          :placeholder="inputT('description.placeholder')"
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
        <LocaleInput
          v-model="shareTitle"
          :locales="props.locales"
          :label="inputT('shareTitle.label')"
          :placeholder="inputT('shareTitle.placeholder')"
          :disabled="!data.overrideShare"
          required
        />
      </AppFormField>

      <AppFormField :help="inputT('shareDescription.help')">
        <LocaleTextArea
          v-model="shareDescription"
          :locales="props.locales"
          :label="inputT('shareDescription.label')"
          :placeholder="inputT('shareDescription.placeholder')"
          :disabled="!data.overrideShare"
          required
        />
      </AppFormField>
    </AppFormBox>
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppInput from '@components/forms/AppInput.vue';
import AppImageUpload from '@components/forms/AppImageUpload.vue';
import useVuelidate from '@vuelidate/core';
import env from '@env';
import slugify from 'slugify';
import AppFormBox from '@beabee/vue/components/form/AppFormBox';
import LocaleTextArea from '@components/forms/LocaleTextArea.vue';
import LocaleInput from '@components/forms/LocaleInput.vue';
import AppToggleField from '@beabee/vue/components/form/AppToggleField';
import AppFormField from '@beabee/vue/components/form/AppFormField';
import type { LocaleProp } from '@type';
import type { SidebarTabProps } from '../SidebarTabs.interface';

/**
 * Data for the title and image tab in the sidebar
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

export type TitleAndImageTabProps = SidebarTabProps<TitleAndImageTabData>;

const emit = defineEmits(['update:error', 'update:validated']);
const props = defineProps<TitleAndImageTabProps>();

const { t } = useI18n();
const inputT = (key: string) =>
  t('createCallout.tabs.titleAndImage.inputs.' + key);

const slug = computed(() =>
  props.data.autoGenerateSlug ? props.data.autoSlug : customSlug.value
);

const customSlug = computed({
  get: () => props.data.slug || props.data.autoSlug,
  // eslint-disable-next-line vue/no-mutating-props
  set: (newSlug) => (props.data.slug = slugify(newSlug)),
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
