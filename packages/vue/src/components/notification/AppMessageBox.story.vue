<script lang="ts" setup>
import { faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { reactive } from 'vue';

import AppMessageBox from './AppMessageBox.vue';

const state = reactive({
  variant: 'info' as const,
  title: 'Information',
  message: 'This is an informational message to help guide users.',
});

const messageVariants = ['info', 'success'] as const;

const sampleMessages = {
  info: {
    icon: faInfoCircle,
    titles: ['Information', 'Notice', 'Update'],
    messages: [
      'Here is some helpful information for you to consider.',
      'Your account settings have been updated successfully.',
      'New features are available in the latest version.',
    ],
  },
  success: {
    icon: faCheckCircle,
    titles: ['Success', 'Completed', 'Done'],
    messages: [
      'Your changes have been saved successfully!',
      'File uploaded successfully.',
      'Account created successfully. Welcome aboard!',
    ],
  },
};
</script>

<template>
  <Story title="Components/Notification/AppMessageBox">
    <Variant title="Playground">
      <div class="space-y-4">
        <AppMessageBox
          :variant="state.variant"
          :title="state.title"
          :icon="sampleMessages[state.variant].icon"
        >
          {{ state.message }}
        </AppMessageBox>
      </div>

      <template #controls>
        <HstSelect
          v-model="state.variant"
          title="Message Variant"
          :options="messageVariants"
        />
        <HstText v-model="state.title" title="Title" />
        <HstText v-model="state.message" title="Message Text" />
      </template>
    </Variant>

    <Variant title="Message Variants">
      <div class="space-y-4">
        <div
          v-for="variant in messageVariants"
          :key="variant"
          class="space-y-2"
        >
          <h4 class="font-medium capitalize">{{ variant }} Messages</h4>
          <AppMessageBox
            :variant="variant"
            :title="sampleMessages[variant].titles[0]"
            :icon="sampleMessages[variant].icon"
          >
            {{ sampleMessages[variant].messages[0] }}
          </AppMessageBox>
        </div>
      </div>
    </Variant>

    <Variant title="Different Titles">
      <div class="space-y-4">
        <div
          v-for="(title, index) in sampleMessages.info.titles"
          :key="title"
          class="space-y-2"
        >
          <AppMessageBox variant="info" :title="title" :icon="faInfoCircle">
            {{ sampleMessages.info.messages[index] }}
          </AppMessageBox>
        </div>
      </div>
    </Variant>

    <Variant title="Long Messages">
      <div class="space-y-4">
        <AppMessageBox
          variant="info"
          title="Detailed Information"
          :icon="faInfoCircle"
        >
          This is a longer informational message that demonstrates how the
          message box handles multiple lines of text. The message can contain
          detailed information that helps users understand complex situations or
          provides comprehensive guidance on how to proceed with their current
          task.
        </AppMessageBox>

        <AppMessageBox
          variant="success"
          title="Operation Complete"
          :icon="faCheckCircle"
        >
          <strong>Congratulations!</strong> Your operation has been completed
          successfully. All data has been processed and saved to the system. You
          can now proceed with the next steps in your workflow. If you need
          assistance with the next phase, please refer to our documentation or
          contact support.
        </AppMessageBox>
      </div>
    </Variant>

    <Variant title="Real-world Examples">
      <div class="space-y-6">
        <div>
          <h4 class="mb-2 font-medium">System Updates</h4>
          <AppMessageBox
            variant="info"
            title="System Maintenance"
            :icon="faInfoCircle"
          >
            The system will undergo scheduled maintenance on Sunday, March 15th
            from 2:00 AM to 6:00 AM EST. During this time, some features may be
            unavailable. We apologize for any inconvenience.
          </AppMessageBox>
        </div>

        <div>
          <h4 class="mb-2 font-medium">Success Confirmations</h4>
          <AppMessageBox
            variant="success"
            title="Profile Updated"
            :icon="faCheckCircle"
          >
            Your profile changes have been saved successfully. It may take a few
            minutes for the changes to appear throughout the system. You will
            receive an email confirmation shortly.
          </AppMessageBox>
        </div>

        <div>
          <h4 class="mb-2 font-medium">Feature Announcements</h4>
          <AppMessageBox
            variant="info"
            title="New Features Available"
            :icon="faInfoCircle"
          >
            We've added new features to enhance your experience:
            <ul class="mt-2 list-disc pl-4">
              <li>Enhanced search functionality</li>
              <li>Improved mobile interface</li>
              <li>New dashboard widgets</li>
              <li>Advanced export options</li>
            </ul>
          </AppMessageBox>
        </div>

        <div>
          <h4 class="mb-2 font-medium">Account Status</h4>
          <AppMessageBox
            variant="success"
            title="Account Verified"
            :icon="faCheckCircle"
          >
            <strong>Welcome!</strong> Your account has been successfully
            verified and activated. You now have access to all premium features.
            Thank you for joining our platform.
          </AppMessageBox>
        </div>
      </div>
    </Variant>

    <Variant title="Multiple Messages">
      <div class="space-y-3">
        <AppMessageBox
          variant="info"
          title="System Notice"
          :icon="faInfoCircle"
        >
          New features have been added to your dashboard.
        </AppMessageBox>

        <AppMessageBox
          variant="success"
          title="Payment Processed"
          :icon="faCheckCircle"
        >
          Your payment was processed successfully.
        </AppMessageBox>

        <AppMessageBox
          variant="info"
          title="Documentation Updated"
          :icon="faInfoCircle"
        >
          The user guide has been updated with new information.
        </AppMessageBox>

        <AppMessageBox
          variant="success"
          title="Backup Complete"
          :icon="faCheckCircle"
        >
          Your data backup has been completed successfully.
        </AppMessageBox>
      </div>
    </Variant>

    <Variant title="Rich Content">
      <div class="space-y-4">
        <AppMessageBox
          variant="info"
          title="Getting Started"
          :icon="faInfoCircle"
        >
          <p class="mb-3">
            Welcome to the platform! Here are some quick tips to get you
            started:
          </p>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="rounded bg-primary-20 px-2 py-1 text-xs font-medium"
                >Step 1</span
              >
              <span class="text-sm">Complete your profile setup</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded bg-primary-20 px-2 py-1 text-xs font-medium"
                >Step 2</span
              >
              <span class="text-sm">Explore the dashboard features</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="rounded bg-primary-20 px-2 py-1 text-xs font-medium"
                >Step 3</span
              >
              <span class="text-sm">Connect with your team</span>
            </div>
          </div>
        </AppMessageBox>

        <AppMessageBox
          variant="success"
          title="Migration Complete"
          :icon="faCheckCircle"
        >
          <p class="mb-3">
            Your data migration has been completed successfully!
          </p>

          <div class="rounded bg-success-10 p-3">
            <p class="text-sm"><strong>Migration Summary:</strong></p>
            <ul class="mt-1 text-sm">
              <li>• 1,247 records migrated</li>
              <li>• 0 errors encountered</li>
              <li>• Processing time: 2.3 seconds</li>
            </ul>
          </div>
        </AppMessageBox>
      </div>
    </Variant>
  </Story>
</template>
