<template>
  <div v-if="canCancel">
    <AppHeading>{{ t('contribution.cancelContribution') }}</AppHeading>

    <p v-if="props.contribution.membershipExpiryDate" class="mb-3 text-sm">
      {{
        t(
          id === 'me'
            ? 'contribution.cancelDescription'
            : 'contribution.adminCancelDescription',
          {
            date: formatLocale(props.contribution.membershipExpiryDate, 'PPP'),
          }
        )
      }}
    </p>

    <AppButton class="w-full" variant="dangerOutlined" @click="$emit('cancel')">
      {{ t('contribution.cancelContribution') }}
    </AppButton>
  </div>
</template>

<script lang="ts" setup>
import { ContributionType, MembershipStatus } from '@beabee/beabee-common';
import AppButton from '../button/AppButton.vue';
import { formatLocale } from '@utils/dates';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppHeading from '../AppHeading.vue';

import type { ContributionInfo } from '@type';

const { t } = useI18n();

defineEmits<{ (evt: 'cancel'): void }>();
const props = defineProps<{
  id: string;
  contribution: ContributionInfo;
}>();

const canCancel = computed(
  () =>
    props.contribution.membershipStatus === MembershipStatus.Active &&
    props.contribution.type === ContributionType.Automatic
);
</script>
