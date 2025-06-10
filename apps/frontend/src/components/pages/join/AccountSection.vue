<template>
  <section>
    <div class="mb-4">
      <AppInput
        v-model="emailProxy"
        :label="t('form.email')"
        type="email"
        name="email"
        required
      />

      <p class="mt-2 text-sm">
        {{ t('join.memberAlready') }}
        <a
          v-if="isEmbed"
          href="/auth/login"
          target="_blank"
          class="text-link underline hover:text-primary"
        >
          {{ t('join.login') }}
        </a>
        <router-link
          v-else
          to="/auth/login"
          class="text-link underline hover:text-primary"
        >
          {{ t('join.login') }}
        </router-link>
      </p>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { isEmbed } from '../../../store';
import AppInput from '../../forms/AppInput.vue';

const emit = defineEmits(['update:email']);
const props = defineProps<{
  email: string;
}>();

const emailProxy = computed({
  get: () => props.email,
  set: (email) => emit('update:email', email),
});

const { t } = useI18n();
</script>
