<script setup lang="ts">
import { ref } from 'vue';

import WelcomeMessage from './WelcomeMessage.vue';

const showMessage = ref(true);

function handleClose() {
  showMessage.value = false;
  // Reset after 2 seconds for demo purposes
  setTimeout(() => {
    showMessage.value = true;
  }, 2000);
}
</script>

<template>
  <Story title="Notification/WelcomeMessage" auto-props-disabled>
    <Variant title="Default">
      <WelcomeMessage
        v-if="showMessage"
        first-name="John"
        last-name="Doe"
        text="<p>Thank you for joining our community! We're excited to have you on board. Here you can manage your profile, view your contributions, and stay updated with our latest news.</p>"
        @close="handleClose"
      />
      <p v-else class="text-gray-500 italic">
        Welcome message was closed. It will reappear in 2 seconds...
      </p>
    </Variant>

    <Variant title="Small Variant">
      <WelcomeMessage
        first-name="Jane"
        last-name="Smith"
        text="<p>This is a smaller version of the welcome message, perfect for compact layouts.</p>"
        small
        @close="() => {}"
      />
    </Variant>

    <Variant title="With Rich Content">
      <WelcomeMessage
        first-name="Alex"
        last-name="Johnson"
        text="<p>Welcome to your dashboard! Here are some things you can do:</p><ul><li>Update your profile information</li><li>Manage your subscription</li><li>View your contribution history</li><li>Connect with other members</li></ul>"
        @close="() => {}"
      />
    </Variant>

    <Variant title="Without Names">
      <WelcomeMessage
        first-name=""
        last-name=""
        text="<p>This welcome message doesn't use personalization but still provides a warm greeting to new users.</p>"
        @close="() => {}"
      />
    </Variant>
  </Story>
</template>
