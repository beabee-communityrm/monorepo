<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <AppFormBox :title="inputT('general.title')">
      <AppFormField :help="inputT('title.help')">
        <LocaleInput
          v-model="data.title"
          :locales="tabs.settings.data.locales"
          :label="inputT('title.label')"
          :placeholder="inputT('title.placeholder')"
          required
        />
      </AppFormField>

      <AppFormField :help="inputT('description.help')">
        <LocaleTextArea
          v-model="data.description"
          :locales="tabs.settings.data.locales"
          :label="inputT('description.label')"
          :placeholder="inputT('description.placeholder')"
          required
        />
      </AppFormField>

      <AppFormField :help="inputT('image.help')">
        <AppImageUpload
          v-model="data.coverImageURL"
          :label="inputT('image.label')"
          :width="1440"
          :height="900"
          required
        />
      </AppFormField>
    </AppFormBox>

    <AppFormBox :title="inputT('slug.boxTitle')">
      <AppFormField :help="inputT('slug.help')">
        <AppToggleField
          v-model="data.useCustomSlug"
          :label="inputT('slug.label')"
          :description="
            data.useCustomSlug
              ? inputT('slug.opts.manual')
              : inputT('slug.opts.auto')
          "
          :disabled="!status || !canEditSlug"
          required
        />
        <AppInput
          v-if="data.useCustomSlug"
          v-model="customSlug"
          :disabled="!canEditSlug"
          required
        >
          <template #before> {{ env.appUrl }}/callouts/ </template>
        </AppInput>
        <p v-else class="mt-2 text-sm">
          {{ t('createCallout.tabs.titleAndImage.urlWillBe') }}
          {{ env.appUrl }}/callouts/{{ slug || '???' }}
        </p>
      </AppFormField>
    </AppFormBox>

    <AppFormBox :title="inputT('sharing.title')">
      <AppFormField>
        <AppToggleField
          v-model="data.overrideShare"
          :label="inputT('overrideShare.label')"
          :description="inputT('overrideShare.description')"
        />
      </AppFormField>

      <AppFormField :help="inputT('shareTitle.help')">
        <LocaleInput
          v-model="shareTitle"
          :locales="tabs.settings.data.locales"
          :label="inputT('shareTitle.label')"
          :placeholder="inputT('shareTitle.placeholder')"
          :disabled="!data.overrideShare"
          required
        />
      </AppFormField>

      <AppFormField :help="inputT('shareDescription.help')">
        <LocaleTextArea
          v-model="shareDescription"
          :locales="tabs.settings.data.locales"
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
import type { CalloutTabs } from '@components/pages/admin/callouts/callouts.interface';
import type { TitleAndImageTabProps } from '../sidebar-tabs.interface';
import env from '@env';
import slugify from 'slugify';
import AppFormBox from '@components/forms/AppFormBox.vue';
import LocaleTextArea from '@components/forms/LocaleTextArea.vue';
import LocaleInput from '@components/forms/LocaleInput.vue';
import AppToggleField from '@components/forms/AppToggleField.vue';
import AppFormField from '@components/forms/AppFormField.vue';

const emit = defineEmits(['update:error', 'update:validated']);
const props = defineProps<{
  data: TitleAndImageTabProps;
  tabs: CalloutTabs;
  status: ItemStatus | undefined;
}>();

const { t } = useI18n();
const inputT = (key: string) =>
  t('createCallout.tabs.titleAndImage.inputs.' + key);

const slug = computed(() =>
  props.data.useCustomSlug ? props.data.slug : props.data.autoSlug
);

const customSlug = computed({
  get: () => props.data.slug,
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
