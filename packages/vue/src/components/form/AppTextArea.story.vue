<script lang="ts" setup>
import { reactive } from 'vue';

import AppTextArea from './AppTextArea.vue';

const state = reactive({
  value: 'This is some initial text content',
  label: 'Description',
  name: 'description',
  infoMessage: 'Please provide a detailed description',
  required: true,
  disabled: false,
  maxlength: 200,
  copyable: false,
  copyButtonDisabled: false,
  placeholder: 'Enter your description here...',
});

// Example states for real-world usage
const socialSharingState = reactive({
  description: 'Check out this amazing new feature we just launched!',
});

const calloutState = reactive({
  intro: 'Welcome to our community survey.',
  description: 'Please share your thoughts and experiences with us.',
});

const bioState = reactive({
  bio: 'A passionate developer who loves creating amazing user experiences.',
});
</script>

<template>
  <Story title="Form/AppTextArea">
    <Variant title="Default" :init-state="() => state">
      <template #default="{ state }">
        <div class="max-w-md">
          <AppTextArea
            v-model="state.value"
            :label="state.label"
            :name="state.name"
            :info-message="state.infoMessage"
            :required="state.required"
            :disabled="state.disabled"
            :maxlength="state.maxlength"
            :copyable="state.copyable"
            :copy-button-disabled="state.copyButtonDisabled"
            :placeholder="state.placeholder"
          />
          <p class="mt-2 text-sm">Current value: {{ state.value }}</p>
        </div>
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.value" title="Value" />
        <HstText v-model="state.label" title="Label" />
        <HstText v-model="state.name" title="Name" />
        <HstText v-model="state.infoMessage" title="Info Message" />
        <HstCheckbox v-model="state.required" title="Required" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstNumber v-model="state.maxlength" title="Max Length" />
        <HstCheckbox v-model="state.copyable" title="Copyable" />
        <HstCheckbox
          v-model="state.copyButtonDisabled"
          title="Copy Button Disabled"
        />
        <HstText v-model="state.placeholder" title="Placeholder" />
      </template>
    </Variant>

    <!-- Validation examples -->
    <Variant title="Validation Examples">
      <div class="space-y-6">
        <div class="max-w-md">
          <h3 class="mb-2 font-semibold">Required Field</h3>
          <AppTextArea
            label="Required Field"
            required
            placeholder="This field is required"
          />
        </div>

        <div class="max-w-md">
          <h3 class="mb-2 font-semibold">Max Length with Character Count</h3>
          <AppTextArea
            label="Limited Text"
            :maxlength="50"
            model-value="This text will show character count"
            placeholder="Type more than 50 characters to see validation"
          />
        </div>

        <div class="max-w-md">
          <h3 class="mb-2 font-semibold">Copyable Content</h3>
          <AppTextArea
            label="Copyable Content"
            model-value="This text can be copied to clipboard"
            copyable
          />
        </div>
      </div>
    </Variant>

    <!-- State examples -->
    <Variant title="Component States">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="max-w-md">
          <h3 class="mb-2 font-semibold">Normal</h3>
          <AppTextArea label="Normal Textarea" model-value="Normal state" />
        </div>

        <div class="max-w-md">
          <h3 class="mb-2 font-semibold">Disabled</h3>
          <AppTextArea
            label="Disabled Textarea"
            model-value="Disabled state"
            disabled
          />
        </div>

        <div class="max-w-md">
          <h3 class="mb-2 font-semibold">With Info Message</h3>
          <AppTextArea
            label="With Info Message"
            info-message="This provides additional context"
            model-value="Content with info"
          />
        </div>

        <div class="max-w-md">
          <h3 class="mb-2 font-semibold">Error State</h3>
          <AppTextArea
            label="Error Example"
            required
            placeholder="Leave empty to see error"
          />
        </div>
      </div>
    </Variant>

    <!-- Real-world usage examples -->
    <Variant title="Real-World Examples">
      <div class="space-y-8">
        <div class="max-w-md">
          <h3 class="mb-4 text-lg font-semibold">Social Media Description</h3>
          <p class="mb-4 text-sm text-body-80">
            Used in admin settings for social media sharing descriptions.
          </p>
          <AppTextArea
            v-model="socialSharingState.description"
            label="Social Sharing Description"
            :maxlength="160"
            required
            info-message="This appears when content is shared on social media"
          />
        </div>

        <div class="max-w-md">
          <h3 class="mb-4 text-lg font-semibold">Callout Configuration</h3>
          <p class="mb-4 text-sm text-body-80">
            Used in callout builder for setting up descriptions.
          </p>
          <div class="space-y-4">
            <AppTextArea
              v-model="calloutState.intro"
              label="Introduction Text"
              info-message="This text appears at the top of your callout form"
              :maxlength="500"
            />
            <AppTextArea
              v-model="calloutState.description"
              label="Detailed Description"
              info-message="Provide detailed instructions for participants"
              :maxlength="1000"
              required
            />
          </div>
        </div>

        <div class="max-w-md">
          <h3 class="mb-4 text-lg font-semibold">User Bio</h3>
          <p class="mb-4 text-sm text-body-80">
            Character-limited bio field with real-time counting.
          </p>
          <AppTextArea
            v-model="bioState.bio"
            label="Short Bio"
            :maxlength="150"
            info-message="Keep it brief and engaging"
            required
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
