<script setup lang="ts">
import AppSlide from './AppSlide.vue';
</script>

<template>
  <Story title="Navigation/AppSlide">
    <Variant title="Basic Usage" description="Simple slide with text content">
      <AppSlide>
        <div class="bg-primary-10 p-8 text-center">
          <h3 class="text-xl font-semibold">Slide Content</h3>
          <p>This is a basic slide with some content.</p>
        </div>
      </AppSlide>
    </Variant>

    <Variant title="Image Content" description="Slide containing an image">
      <AppSlide aria-label="Image slide">
        <div class="text-center">
          <img
            class="mx-auto max-w-full rounded"
            src="https://picsum.photos/400/200"
            alt="Sample image"
          />
          <p class="mt-4">Slide with image content</p>
        </div>
      </AppSlide>
    </Variant>

    <Variant title="Rich Content" description="Slide with mixed content types">
      <AppSlide aria-label="Rich content slide">
        <div class="bg-success-10 p-6">
          <div class="flex items-center justify-center">
            <div class="max-w-md text-center">
              <h2 class="mb-4 text-2xl font-bold text-success-110">Success!</h2>
              <p class="mb-4">
                This slide contains rich content with multiple elements.
              </p>
              <button
                class="rounded bg-success px-4 py-2 text-white hover:bg-success-70"
              >
                Action Button
              </button>
            </div>
          </div>
        </div>
      </AppSlide>
    </Variant>

    <Variant
      title="Custom Styling"
      description="Slide with custom background and styling"
    >
      <AppSlide aria-label="Custom styled slide">
        <div class="bg-primary p-12 text-white">
          <div class="text-center">
            <h2 class="mb-4 text-3xl font-bold">Custom Slide</h2>
            <p class="text-lg opacity-90">
              You can customize slides with any styling you need.
            </p>
          </div>
        </div>
      </AppSlide>
    </Variant>

    <Variant
      title="Accessibility Features"
      description="Slide with custom ARIA attributes"
    >
      <AppSlide
        aria-label="Accessibility demonstration slide"
        aria-role-description="informational slide"
      >
        <div class="border border-link-30 bg-link-10 p-6">
          <h3 class="mb-2 font-semibold text-link-110">
            Accessibility Features
          </h3>
          <ul class="list-disc pl-5 text-link-70">
            <li>Custom aria-label support</li>
            <li>Configurable role descriptions</li>
            <li>Screen reader friendly</li>
          </ul>
        </div>
      </AppSlide>
    </Variant>
  </Story>
</template>
