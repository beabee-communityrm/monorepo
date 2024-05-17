<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <AppFormSection :help="inputT('title.help')">
      <LocaleInput
        v-model="data.title"
        :locales="steps.settings.data.locales"
        :label="inputT('title.label')"
        :placeholder="inputT('title.placeholder')"
        required
      />
    </AppFormSection>
    <AppFormSection :help="inputT('description.help')">
      <LocaleTextArea
        v-model="data.description"
        :locales="steps.settings.data.locales"
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
    <AppFormSection :help="inputT('intro.help')">
      <LocaleRichTextEditor
        v-model="data.introText"
        :locales="steps.settings.data.locales"
        :label="inputT('intro.label')"
        required
      />
    </AppFormSection>
    <AppFormSection v-if="canEditSlug" :help="inputT('slug.help')">
      <AppLabel :label="inputT('slug.label')" required />
      <AppRadioGroup
        v-if="!status"
        v-model="data.useCustomSlug"
        name="useCustomSlug"
        :options="[
          [false, inputT('slug.opts.auto')],
          [true, inputT('slug.opts.manual')],
        ]"
        required
      />
      <AppInput v-if="data.useCustomSlug" v-model="customSlug" required>
        <template #before> {{ env.appUrl }}/callouts/ </template>
      </AppInput>
      <p v-else class="mt-2 text-sm">
        {{ t('createCallout.steps.titleAndImage.urlWillBe') }}
        {{ env.appUrl }}/callouts/{{ slug || '???' }}
      </p>
    </AppFormSection>
    <AppFormSection>
      <AppRadioGroup
        v-model="data.overrideShare"
        name="overrideShare"
        :label="inputT('overrideShare.label')"
        :options="[
          [false, inputT('overrideShare.opts.yes')],
          [true, inputT('overrideShare.opts.no')],
        ]"
        required
      />
    </AppFormSection>
    <template v-if="data.overrideShare">
      <AppFormSection :help="inputT('shareTitle.help')">
        <LocaleInput
          v-model="data.shareTitle"
          :locales="steps.settings.data.locales"
          :label="inputT('shareTitle.label')"
          :placeholder="inputT('shareTitle.placeholder')"
          required
        />
      </AppFormSection>
      <AppFormSection :help="inputT('shareDescription.help')">
        <LocaleTextArea
          v-model="data.shareDescription"
          :locales="steps.settings.data.locales"
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
import AppInput from '../../../../forms/AppInput.vue';
import AppImageUpload from '../../../../forms/AppImageUpload.vue';
import useVuelidate from '@vuelidate/core';
import type {
  CalloutSteps,
  TitleAndImageStepProps,
} from '../callouts.interface';
import AppRadioGroup from '../../../../forms/AppRadioGroup.vue';
import AppLabel from '../../../../forms/AppLabel.vue';
import env from '../../../../../env';
import slugify from 'slugify';
import AppFormSection from '../../../../forms/AppFormSection.vue';
import LocaleTextArea from '@components/forms/LocaleTextArea.vue';
import LocaleInput from '@components/forms/LocaleInput.vue';
import LocaleRichTextEditor from '@components/forms/LocaleRichTextEditor.vue';

const emit = defineEmits(['update:error', 'update:validated']);
const props = defineProps<{
  data: TitleAndImageStepProps;
  steps: CalloutSteps;
  status: ItemStatus | undefined;
}>();

const { t } = useI18n();
const inputT = (key: string) =>
  t('createCallout.steps.titleAndImage.inputs.' + key);

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
