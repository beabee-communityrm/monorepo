<template>
  <div>
    <AppLabel v-if="label" :label="label" :required="required" />
    <div class="flex items-start gap-4">
      <div
        class="relative flex-none basis-28 overflow-hidden rounded border border-primary-40 bg-primary-20"
      >
        <img
          :src="imageUrl"
          :width="width"
          :height="height"
          class="h-auto w-full bg-white"
          :class="!imageUrl && 'invisible'"
        />
        <span
          v-if="uploading"
          class="absolute inset-0 flex items-center justify-center bg-black/50 text-xl text-white"
        >
          <font-awesome-icon :icon="faCircleNotch" spin />
        </span>
      </div>
      <div>
        <AppButton is="label" class="mr-2">
          <input
            ref="inputRef"
            type="file"
            accept="image/jpeg,image/png"
            class="sr-only"
            :aria-label="t('actions.chooseFile')"
            @change="handleChange"
          />
          {{ t('actions.chooseFile') }}
        </AppButton>
        <p
          v-if="description"
          :id="`${id}-description`"
          class="mt-1 max-w-[200px] text-sm"
        >
          {{ description }}
        </p>
        <AppInputError v-if="formError" :message="formError" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { helpers, requiredIf, sameAs } from '@vuelidate/validators';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { client, ClientApiError } from '@utils/api';
import { AppButton, AppLabel } from '@beabee/vue/components';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import AppInputError from '@components/forms/AppInputError.vue';

const emit = defineEmits(['update:modelValue']);

export interface AppImageUploadProps {
  /** The image URL value */
  modelValue: unknown;
  /** Width of the image */
  width: number;
  /** Height of the image */
  height: number;
  /** Label for the upload field */
  label?: string;
  /** Description text below the upload button */
  description?: string;
  /** Whether the field is required */
  required?: boolean;
}

const props = defineProps<AppImageUploadProps>();

const { t } = useI18n();

const inputRef = ref<HTMLInputElement>();
const uploading = ref(false);
const imageUrl = ref(props.modelValue as string);
const formError = ref('');

// Generate unique ID for aria attributes
const id = computed(
  () => `image-upload-${Math.random().toString(36).substring(2, 11)}`
);

const rules = computed(() => ({
  v: {
    required: helpers.withMessage(
      t('form.errors.unknown.required'),
      requiredIf(!!props.required)
    ),
  },
  uploading: { equal: sameAs(false) },
}));

useVuelidate(rules, { v: imageUrl, uploading });

watch(toRef(props, 'modelValue'), (newModelValue) => {
  imageUrl.value = newModelValue as string;
  if (inputRef.value) {
    inputRef.value.value = '';
  }
});

async function handleChange() {
  const file = inputRef.value?.files?.item(0);
  if (!file) return;

  uploading.value = true;
  formError.value = '';

  try {
    const flow = await client.upload.createFlow();
    const { url } = await client.upload.uploadFile(file, flow.id);

    imageUrl.value = URL.createObjectURL(file);
    emit('update:modelValue', `${url}?w=${props.width}&h=${props.height}`);
  } catch (error) {
    if (error instanceof ClientApiError) {
      formError.value =
        error.code === 'RATE_LIMIT_EXCEEDED'
          ? t('form.errors.file.rateLimited')
          : error.code === 'FILE_TOO_LARGE'
            ? t('form.errors.file.tooBig')
            : t('form.errorMessages.generic');
    } else {
      formError.value = t('form.errorMessages.generic');
    }
  }

  uploading.value = false;
}
</script>
