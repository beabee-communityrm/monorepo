<script lang="ts" setup>
import {
  faCheckCircle,
  faExclamationTriangle,
  faHome,
  faInfo,
  faUser,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { reactive, ref } from 'vue';

import { AppButton } from '../button';
import AppTemplate from './AppTemplate.vue';

const state = reactive({
  title: 'Template Example',
  description: 'This is a demonstration of the template component',
  variant: 'primary' as const,
  size: 'md' as const,
  badge: '',
  disabled: false,
  showIcon: true,
  showDescription: true,
  showBadge: false,
});

const variants = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
] as const;
const sizes = ['sm', 'md', 'lg'] as const;

const clickCount = ref(0);

function handleClick() {
  clickCount.value++;
}

function handleActivate() {
  clickCount.value++;
}
</script>

<template>
  <Story title="Template/AppTemplate">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <AppTemplate
          :title="state.title"
          :description="state.showDescription ? state.description : undefined"
          :variant="state.variant"
          :size="state.size"
          :icon="state.showIcon ? faHome : undefined"
          :badge="state.showBadge ? state.badge || 'New' : undefined"
          :disabled="state.disabled"
          @click="handleClick"
          @activate="handleActivate"
        >
          <p>This is the main content slot where you can place any content.</p>
          <p>Click count: {{ clickCount }}</p>

          <template #footer>
            <div class="flex gap-2">
              <AppButton size="sm" variant="primaryOutlined">
                Action 1
              </AppButton>
              <AppButton size="sm" variant="text"> Action 2 </AppButton>
            </div>
          </template>
        </AppTemplate>
      </div>

      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstText v-model="state.description" title="Description" />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
        <HstText v-model="state.badge" title="Badge Text" />
        <HstCheckbox v-model="state.showIcon" title="Show Icon" />
        <HstCheckbox v-model="state.showDescription" title="Show Description" />
        <HstCheckbox v-model="state.showBadge" title="Show Badge" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant title="Variants">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AppTemplate
          v-for="variant in variants"
          :key="variant"
          :title="`${variant} Variant`"
          :description="`This demonstrates the ${variant} styling variant`"
          :variant="variant"
          :icon="
            variant === 'success'
              ? faCheckCircle
              : variant === 'warning'
                ? faWarning
                : variant === 'danger'
                  ? faExclamationTriangle
                  : faInfo
          "
          @click="handleClick"
        >
          <p>Content for {{ variant }} variant</p>
        </AppTemplate>
      </div>
    </Variant>

    <Variant title="Sizes">
      <div class="flex flex-col gap-4">
        <AppTemplate
          v-for="size in sizes"
          :key="size"
          :title="`${size.toUpperCase()} Size`"
          :description="`This demonstrates the ${size} size variant`"
          :size="size"
          :icon="faUser"
          @click="handleClick"
        >
          <p>Content for {{ size }} size</p>
        </AppTemplate>
      </div>
    </Variant>

    <Variant title="With Badge">
      <div class="flex flex-col gap-4">
        <AppTemplate
          title="New Feature"
          description="This template includes a badge indicator"
          variant="primary"
          :icon="faHome"
          badge="New"
          @click="handleClick"
        >
          <p>This component has a badge in the header.</p>
        </AppTemplate>

        <AppTemplate
          title="Updated Component"
          description="This shows a different badge style"
          variant="success"
          :icon="faCheckCircle"
          badge="Updated"
          @click="handleClick"
        >
          <p>This component shows an updated badge.</p>
        </AppTemplate>
      </div>
    </Variant>

    <Variant title="Without Footer">
      <div class="max-w-md">
        <AppTemplate
          title="Simple Template"
          description="This template doesn't use the footer slot"
          variant="secondary"
          :icon="faInfo"
          @click="handleClick"
        >
          <p>This is a simpler template without footer actions.</p>
          <ul class="mt-2 list-disc pl-4">
            <li>Feature 1</li>
            <li>Feature 2</li>
            <li>Feature 3</li>
          </ul>
        </AppTemplate>
      </div>
    </Variant>

    <Variant title="Disabled State">
      <div class="max-w-md">
        <AppTemplate
          title="Disabled Template"
          description="This template is disabled and cannot be interacted with"
          variant="secondary"
          :icon="faExclamationTriangle"
          disabled
          @click="handleClick"
        >
          <p>This content is disabled and not interactive.</p>

          <template #footer>
            <AppButton size="sm" disabled> Disabled Action </AppButton>
          </template>
        </AppTemplate>
      </div>
    </Variant>

    <Variant title="Minimal Template">
      <div class="max-w-md">
        <AppTemplate title="Minimal Template" @click="handleClick">
          <p>This is the most basic usage with just a title and content.</p>
        </AppTemplate>
      </div>
    </Variant>

    <Variant title="Complex Content">
      <div class="max-w-md">
        <AppTemplate
          title="User Profile"
          description="Manage your account settings and preferences"
          variant="primary"
          :icon="faUser"
          badge="Pro"
          @click="handleClick"
        >
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="h-12 w-12 rounded-full bg-primary-20"></div>
              <div>
                <p class="font-medium">John Doe</p>
                <p class="text-sm text-body-80">john.doe@example.com</p>
              </div>
            </div>

            <div class="rounded bg-grey-lighter p-3">
              <p class="text-sm"><strong>Last login:</strong> 2 hours ago</p>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-between">
              <AppButton size="sm" variant="text"> View Profile </AppButton>
              <AppButton size="sm" variant="primaryOutlined">
                Edit Settings
              </AppButton>
            </div>
          </template>
        </AppTemplate>
      </div>
    </Variant>
  </Story>
</template>
