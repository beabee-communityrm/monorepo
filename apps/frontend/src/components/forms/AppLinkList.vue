<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <div v-for="(link, i) in modelValue" :key="i" class="mb-4 flex gap-4">
      <div class="flex-1">
        <AppInput
          v-model="modelValue[i].text"
          :label="t('adminSettings.general.footer.otherLinks.linkText')"
          required
        />
      </div>
      <div class="flex-1">
        <AppInput
          v-model="modelValue[i].url"
          :label="t('adminSettings.general.footer.otherLinks.url')"
          type="text"
          required
        />
      </div>
      <div class="flex-0 self-end">
        <button
          class="-ml-2 p-2 leading-tight text-primary-80 hover:text-primary"
          type="button"
          @click="removeLink(i)"
        >
          <font-awesome-icon :icon="faTimes" />
        </button>
      </div>
    </div>

    <AppButton
      variant="primaryOutlined"
      size="sm"
      :icon="faPlus"
      @click="addLink"
    >
      {{ t('adminSettings.general.footer.otherLinks.add') }}
    </AppButton>
  </div>
</template>
<script lang="ts" setup>
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';
import AppButton from '../button/AppButton.vue';
import AppInput from './AppInput.vue';

const props = defineProps<{
  modelValue: { text: string; url: string }[];
}>();

const { t } = useI18n();

function addLink() {
  // eslint-disable-next-line vue/no-mutating-props
  props.modelValue.push({ text: '', url: '' });
}

function removeLink(n: number) {
  // eslint-disable-next-line vue/no-mutating-props
  props.modelValue.splice(n, 1);
}
</script>
