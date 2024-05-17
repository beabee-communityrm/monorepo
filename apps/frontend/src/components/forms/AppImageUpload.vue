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
            @change="handleChange"
          />
          {{ t('actions.chooseFile') }}
        </AppButton>
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
import { instance, isRequestError } from '@utils/api';
import env from '../../env';
import AppButton from '../button/AppButton.vue';
import AppLabel from './AppLabel.vue';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { createUploadFlow } from '../../utils/api/upload';
import AppInputError from './AppInputError.vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: unknown; // TODO: should be string but vuelidate $model is unknown
  width: number;
  height: number;
  label?: string;
  required?: boolean;
}>();

const { t } = useI18n();

const inputRef = ref<HTMLInputElement>();
const uploading = ref(false);
const imageUrl = ref(props.modelValue as string);
const formError = ref('');

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

  if (!file) {
    return;
  }

  if (file.size > 20 * 1024 * 1024) {
    formError.value = t('form.errors.file.tooBig');
    return;
  }

  const data = new FormData();
  data.append('file', file);

  uploading.value = true;
  formError.value = '';

  try {
    const uploadFlow = await createUploadFlow();

    const resp = await instance.post('/upload/', data, {
      baseURL: env.appUrl,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        token: uploadFlow.id,
      },
    });

    imageUrl.value = URL.createObjectURL(file);

    emit(
      'update:modelValue',
      `${resp.data.url}?w=${props.width}&h=${props.height}`
    );
  } catch (err) {
    formError.value = isRequestError(err, undefined, [429])
      ? t('form.errors.file.rateLimited')
      : t('form.errorMessages.generic');
  }

  uploading.value = false;
}
</script>
