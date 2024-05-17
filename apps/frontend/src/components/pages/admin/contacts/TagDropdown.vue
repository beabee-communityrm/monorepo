<template>
  <AppLabel v-if="label" :label="label" />
  <div class="mb-1 mt-1 flex flex-row flex-wrap">
    <AppTag
      v-for="tag in modelValue"
      :key="tag"
      :tag="tag"
      :has-remove-icon="true"
      @click:remove-tag="handleRemoveTag(tag)"
    />
  </div>
  <div class="flex flex-col sm:flex-row">
    <div
      class="w-full cursor-pointer rounded border border-primary-40 bg-white p-2 align-middle hover:bg-white focus:shadow-input sm:w-1/2 sm:min-w-[17rem]"
      :class="isTagMenuVisible ? 'h-auto focus:shadow-input' : ''"
      @click="isTagMenuVisible = !isTagMenuVisible"
    >
      <p class="align-middle">
        <font-awesome-icon
          class="ml-2 mr-2 inline-block cursor-pointer"
          :icon="faCaretDown"
        />
        {{ t('contactOverview.pickTag') }}
      </p>
      <div :class="isTagMenuVisible ? 'block' : 'hidden'" class="">
        <p
          v-for="tag in availableTags"
          :key="tag"
          class="p-2 first:mt-2 hover:bg-primary-20"
          @click="handleAddTag(tag)"
        >
          <font-awesome-icon
            class="ml-2 mr-2 inline-block cursor-pointer"
            :icon="faTag"
          />
          {{ tag }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { faCaretDown, faTag } from '@fortawesome/free-solid-svg-icons';
import { ref } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppTag from '../../../AppTag.vue';
import AppLabel from '../../../forms/AppLabel.vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  tags: string[];
  modelValue: string[];
  label?: string;
}>();

const { t } = useI18n();

const isTagMenuVisible = ref(false);

const availableTags = computed(() =>
  props.tags.filter((e) => !props.modelValue.includes(e))
);

const handleAddTag = (tag: string) => {
  emit('update:modelValue', [...props.modelValue, tag]);
};
const handleRemoveTag = (tag: string) => {
  emit(
    'update:modelValue',
    props.modelValue.filter((e) => e != tag)
  );
};
</script>
