<script lang="ts" setup>
import AppCategoryLabel from './AppCategoryLabel.vue';
import AppHeading from './AppHeading.vue';
import AppHelperText from './AppHelperText.vue';
import AppSectionHeading from './AppSectionHeading.vue';
import AppSubHeading from './AppSubHeading.vue';
import AppTitle from './AppTitle.vue';
</script>

<template>
  <Story title="Typography/Headings" :layout="{ type: 'grid', width: '100%' }">
    <Variant title="Typography Hierarchy" icon="carbon:text-font">
      <div class="space-y-6">
        <div>
          <AppTitle>H1 - Main Title</AppTitle>
          <p class="text-sm text-body-80">
            font-title text-3.5xl/tight font-semibold
          </p>
        </div>

        <div>
          <AppTitle big>H1 - Big Title (Responsive)</AppTitle>
          <p class="text-sm text-body-80">
            text-3.5xl/tight md:text-5xl/tight font-semibold
          </p>
        </div>

        <div>
          <AppTitle light>H1 - Light Title</AppTitle>
          <p class="text-sm text-body-80">
            font-title text-3.5xl/tight font-light
          </p>
        </div>

        <div>
          <AppHeading>H2 - Section Heading</AppHeading>
          <p class="text-sm text-body-80">
            font-title text-2.2xl/tight font-semibold text-body-60
          </p>
        </div>

        <div>
          <AppSubHeading>H3 - Subsection Heading</AppSubHeading>
          <p class="text-sm text-body-80">
            font-title text-1.8xl/tight font-semibold text-body-60
          </p>
        </div>

        <div>
          <AppSectionHeading>H4 - Section Title</AppSectionHeading>
          <p class="text-sm text-body-80">
            font-title text-xl font-regular text-body
          </p>
        </div>

        <div>
          <AppCategoryLabel>Category Label</AppCategoryLabel>
          <p class="text-sm text-body-80">
            text-xs font-semibold uppercase tracking-wide text-body-80
          </p>
        </div>

        <div>
          <AppHelperText>Helper text for descriptions</AppHelperText>
          <p class="text-sm text-body-80">text-xs text-body-80</p>
        </div>
      </div>
    </Variant>

    <Variant title="Title Variants" icon="carbon:text-bold">
      <template #controls>
        <HstCheckbox v-model="state.big" title="Big size" />
        <HstCheckbox v-model="state.light" title="Light weight" />
        <HstCheckbox v-model="state.noMargin" title="No margin" />
      </template>

      <AppTitle
        :big="state.big"
        :light="state.light"
        :no-margin="state.noMargin"
      >
        Interactive Title
      </AppTitle>
    </Variant>

    <Variant title="Content Example" icon="carbon:document">
      <article class="max-w-prose">
        <AppTitle>Article Title</AppTitle>
        <p class="mb-6 text-body-80">
          Introduction paragraph with some sample content to show how the
          typography components work together.
        </p>

        <AppHeading>Section Heading</AppHeading>
        <p class="mb-4">
          This is a paragraph under a section heading. The typography components
          provide consistent spacing and hierarchy.
        </p>

        <AppSubHeading>Subsection</AppSubHeading>
        <p class="mb-4">
          Content under a subsection heading demonstrates the visual hierarchy.
        </p>

        <AppSectionHeading>Section Title</AppSectionHeading>
        <p>
          Final section with the smallest heading level in our typography
          system.
        </p>
      </article>
    </Variant>
  </Story>
</template>

<script lang="ts">
export default {
  data() {
    return {
      state: {
        big: false,
        light: false,
        noMargin: false,
      },
    };
  },
};
</script>
