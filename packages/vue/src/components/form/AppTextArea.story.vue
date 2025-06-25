<script lang="ts" setup>
import { reactive, ref } from 'vue';

import AppTextArea from './AppTextArea.vue';

const state = reactive({
  description: 'This is a sample description that can be edited.',
  label: 'Description',
  required: false,
  disabled: false,
  maxlength: undefined as number | undefined,
  copyable: false,
  requiredErrorText: 'This field is required',
  maxLengthErrorText: 'Must be no more than {max} characters',
  characterCountText: '{remaining} of {max} characters remaining',
});

const socialSharingState = reactive({
  description:
    'Beabee is a community engagement platform designed specifically for community newsrooms and member-driven organizations.',
});

const calloutState = reactive({
  description:
    'Please provide detailed information about your experience. The more specific you can be, the better we can understand your situation.',
  intro:
    'Thank you for participating in our community callout. Your input helps us better serve our members.',
});

const translationState = reactive({
  title: 'Community Survey',
  description:
    'We value your feedback and want to hear from our community members about their experiences and suggestions for improvement.',
});

const limitedTextState = reactive({
  bio: 'This is a short bio that should not exceed 150 characters.',
});

const standardText = ref('This is standard text content.');
const requiredText = ref('');
const disabledText = ref('This content cannot be edited.');
const copyableText = ref(
  'This is some important content that users might want to copy.'
);
</script>

<template>
  <Story title="Form/AppTextArea">
    <Variant title="Playground">
      <div class="max-w-2xl space-y-6">
        <AppTextArea
          v-model="state.description"
          :label="state.label"
          :required="state.required"
          :disabled="state.disabled"
          :maxlength="state.maxlength"
          :copyable="state.copyable"
          :required-error-text="state.requiredErrorText"
          :max-length-error-text="state.maxLengthErrorText"
          :character-count-text="state.characterCountText"
        />

        <div class="text-sm text-grey-dark">
          <p>Current value length: {{ state.description.length }} characters</p>
          <p v-if="state.maxlength">
            Remaining:
            {{ state.maxlength - state.description.length }} characters
          </p>
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.label" title="Label" />
        <HstText v-model="state.description" title="Value" />
        <HstCheckbox v-model="state.required" title="Required" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstCheckbox v-model="state.copyable" title="Copyable" />
        <HstNumber v-model="state.maxlength" title="Max Length" />
        <HstText
          v-model="state.requiredErrorText"
          title="Required Error Text"
        />
        <HstText
          v-model="state.maxLengthErrorText"
          title="Max Length Error Text"
        />
        <HstText
          v-model="state.characterCountText"
          title="Character Count Text"
        />
      </template>
    </Variant>

    <Variant title="Social Sharing Description">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Social Media Description</h3>
          <p class="mb-4 text-sm text-body-80">
            Used in admin settings for configuring social media sharing
            descriptions. This text appears when your content is shared on
            platforms like Facebook and Twitter.
          </p>

          <AppTextArea
            v-model="socialSharingState.description"
            label="Social Sharing Description"
            :maxlength="160"
            required
            required-error-text="A description is required for social sharing"
            max-length-error-text="Description must be no more than 160 characters for optimal social sharing"
            character-count-text="{remaining} characters remaining"
          />

          <div class="mt-4 rounded bg-grey-lighter p-3">
            <p class="text-xs font-medium text-grey-dark">Preview:</p>
            <p class="mt-1 text-sm">{{ socialSharingState.description }}</p>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Callout Descriptions">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Callout Configuration</h3>
          <p class="mb-4 text-sm text-body-80">
            Used in callout builder for setting up descriptions and
            instructions.
          </p>

          <div class="space-y-4">
            <AppTextArea
              v-model="calloutState.intro"
              label="Introduction Text"
              info-message="This text appears at the top of your callout form"
              :maxlength="500"
              character-count-text="{remaining} of {max} characters remaining"
            />

            <AppTextArea
              v-model="calloutState.description"
              label="Detailed Description"
              info-message="Provide detailed instructions for participants"
              :maxlength="1000"
              required
              required-error-text="A description is required for the callout"
              character-count-text="{remaining} of {max} characters remaining"
            />
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Translation Management">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Content Translation</h3>
          <p class="mb-4 text-sm text-body-80">
            Used in translation tabs for managing multilingual content.
          </p>

          <div class="space-y-4">
            <AppTextArea
              v-model="translationState.description"
              label="English Description"
              info-message="This will be translated into other languages"
              :maxlength="2000"
              required
              required-error-text="English description is required"
            />

            <div class="rounded bg-primary-10 p-3">
              <p class="text-xs font-medium text-primary-80">
                Translation Note:
              </p>
              <p class="mt-1 text-xs text-primary-70">
                Keep descriptions clear and concise to ensure accurate
                translations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Character Limits">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Bio with Character Limit</h3>
          <p class="mb-4 text-sm text-body-80">
            Example of a textarea with strict character limits and real-time
            counting.
          </p>

          <AppTextArea
            v-model="limitedTextState.bio"
            label="Short Bio"
            :maxlength="150"
            info-message="Keep it brief and engaging"
            required
            required-error-text="Bio is required"
            max-length-error-text="Bio must be no more than 150 characters"
            character-count-text="{remaining} characters remaining"
          />
        </div>
      </div>
    </Variant>

    <Variant title="States">
      <div class="max-w-2xl space-y-6">
        <div class="rounded border p-6">
          <h3 class="mb-4 text-lg font-semibold">Different States</h3>

          <div class="space-y-6">
            <div>
              <h4 class="mb-2 text-sm font-semibold">Standard</h4>
              <AppTextArea
                v-model="standardText"
                label="Standard Textarea"
                info-message="This is a standard textarea"
              />
            </div>

            <div>
              <h4 class="mb-2 text-sm font-semibold">Required</h4>
              <AppTextArea
                v-model="requiredText"
                label="Required Textarea"
                required
                info-message="This field must be filled out"
              />
            </div>

            <div>
              <h4 class="mb-2 text-sm font-semibold">Disabled</h4>
              <AppTextArea
                v-model="disabledText"
                label="Disabled Textarea"
                disabled
                info-message="This field is disabled"
              />
            </div>

            <div>
              <h4 class="mb-2 text-sm font-semibold">Copyable</h4>
              <AppTextArea
                v-model="copyableText"
                label="Copyable Content"
                copyable
                info-message="Click the copy button to copy this content"
              />
            </div>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
