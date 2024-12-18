<template>
  <span
    class="inline-flex rounded border border-primary-40 focus-within:shadow-input"
  >
    <button
      type="button"
      class="flex-0 bg-primary-20 px-2"
      @click="isRelative = !isRelative"
    >
      <font-awesome-icon
        :icon="isRelative ? faCircleArrowRight : faCircleDot"
      />
    </button>
    <div>
      <input
        v-if="isRelative"
        v-model="relativeValue"
        type="text"
        class="block w-[10rem] p-2 leading-tight focus:outline-none"
        placeholder="$now(d:-1)"
      />
      <input
        v-else
        v-model="dateValue"
        type="date"
        class="block w-[10rem] p-2 leading-tight focus:outline-none"
      />
    </div>
  </span>
</template>
<script lang="ts" setup>
import {
  faCircleArrowRight,
  faCircleDot,
} from '@fortawesome/free-solid-svg-icons';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { computed, ref, watch } from 'vue';
const emit = defineEmits(['update:modelValue']);
const props = defineProps<{ modelValue: string }>();

const isRelative = ref(props.modelValue.startsWith('$now'));

const relativeValue = ref(isRelative.value ? props.modelValue : '');
const dateValue = ref(isRelative.value ? '' : props.modelValue);

const currentValue = computed(() =>
  isRelative.value ? relativeValue.value : dateValue.value
);

watch(currentValue, (newValue) => {
  emit('update:modelValue', newValue);
});

useVuelidate({ v: { required } }, { v: currentValue });
</script>
