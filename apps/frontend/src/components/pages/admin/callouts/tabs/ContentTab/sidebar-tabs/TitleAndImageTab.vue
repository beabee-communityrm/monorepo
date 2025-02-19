<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <AppFormSection :help="inputT('title.help')">
      <LocaleInput
        v-model="data.title"
        :locales="tabs.settings.data.locales"
        :label="inputT('title.label')"
        :placeholder="inputT('title.placeholder')"
        required
      />
    </AppFormSection>
    <AppFormSection :help="inputT('description.help')">
      <LocaleTextArea
        v-model="data.description"
        :locales="tabs.settings.data.locales"
        :label="inputT('description.label')"
        :placeholder="inputT('description.placeholder')"
        required
      />
    </AppFormSection>
    <AppFormSection :help="inputT('image.help')">
      <AppImageUpload
        v-model="data.coverImageURL"
        :label="inputT('image.label')"
        :width="1440"
        :height="900"
        required
      />
    </AppFormSection>
    <AppFormSection v-if="canEditSlug" :help="inputT('slug.help')">
      <AppToggleField
        v-if="!status"
        v-model="data.useCustomSlug"
        :label="inputT('slug.label')"
        :description="
          data.useCustomSlug
            ? inputT('slug.opts.manual')
            : inputT('slug.opts.auto')
        "
        required
      />
      <AppInput v-if="data.useCustomSlug" v-model="customSlug" required>
        <template #before> {{ env.appUrl }}/callouts/ </template>
      </AppInput>
      <p v-else class="mt-2 text-sm">
        {{ t('createCallout.tabs.titleAndImage.urlWillBe') }}
        {{ env.appUrl }}/callouts/{{ slug || '???' }}
      </p>
    </AppFormSection>
    <AppFormSection>
      <AppToggleField
        v-model="data.overrideShare"
        :label="inputT('overrideShare.label')"
        :description="
          data.overrideShare
            ? inputT('overrideShare.opts.no')
            : inputT('overrideShare.opts.yes')
        "
        required
      />
    </AppFormSection>
    <template v-if="data.overrideShare">
      <AppFormSection :help="inputT('shareTitle.help')">
        <LocaleInput
          v-model="data.shareTitle"
          :locales="tabs.settings.data.locales"
          :label="inputT('shareTitle.label')"
          :placeholder="inputT('shareTitle.placeholder')"
          required
        />
      </AppFormSection>
      <AppFormSection :help="inputT('shareDescription.help')">
        <LocaleTextArea
          v-model="data.shareDescription"
          :locales="tabs.settings.data.locales"
          :label="inputT('shareDescription.label')"
          :placeholder="inputT('shareDescription.placeholder')"
          required
        />
      </AppFormSection>
    </template>
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
import AppFormSection from '@components/forms/AppFormSection.vue';
import LocaleTextArea from '@components/forms/LocaleTextArea.vue';
import LocaleInput from '@components/forms/LocaleInput.vue';
import AppToggleField from '@components/forms/AppToggleField.vue';

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

// TODO: FIXME should just be a computed
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
