<script lang="ts" setup>
import { reactive } from 'vue';

import AppWelcomeCard from './AppWelcomeCard.vue';

const state = reactive({
  firstName: 'Marta',
  text: '<p>Thanks for joining. This is your home: open crowdNewsrooms, your contribution and your newsletters all live here.</p>',
  level: 3 as 2 | 3 | 4 | 5 | 6,
  dismissible: true,
});
</script>

<template>
  <Story title="Card/AppWelcomeCard">
    <Variant title="Playground">
      <div class="nuxt-page max-w-3xl">
        <AppWelcomeCard
          :first-name="state.firstName"
          :text="state.text"
          :level="state.level"
          :dismissible="state.dismissible"
        />
      </div>

      <template #controls>
        <HstText v-model="state.firstName" title="First name" />
        <HstTextarea v-model="state.text" title="Text (HTML)" />
        <HstNumber
          v-model="state.level"
          title="Heading level"
          :min="2"
          :max="6"
        />
        <HstCheckbox v-model="state.dismissible" title="Dismissible" />
      </template>
    </Variant>

    <Variant title="Preview, not dismissible">
      <div class="nuxt-page max-w-md">
        <AppWelcomeCard
          first-name="Marta"
          text="<p>Thanks for joining.</p>"
          :dismissible="false"
        />
      </div>
    </Variant>

    <Variant title="Long message with a list">
      <div class="nuxt-page max-w-3xl">
        <AppWelcomeCard
          first-name="Marta"
          text="<p>Thanks for joining. Here's what you can do next:</p><ul><li>Take part in an open crowdNewsroom</li><li>Set up your contribution</li><li>Choose your newsletters</li></ul><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>"
        />
      </div>
    </Variant>
  </Story>
</template>
