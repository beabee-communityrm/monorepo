<script setup lang="ts">
import { ref } from 'vue';

import type { AppSliderSlideEventDetails, AppStepperStep } from '../../types';
import AppSlide from './AppSlide.vue';
import AppSlider from './AppSlider.vue';

// Reactive variables for interactive example
const showStepper = ref(false);
const infiniteLoop = ref(false);
const isDisabled = ref(false);
const currentInteractiveSlide = ref(0);
const lastSlideEvent = ref('None');

const steps: AppStepperStep[] = [
  { name: 'Introduction', validated: true, error: false },
  { name: 'Information', validated: false, error: false },
  { name: 'Conclusion', validated: false, error: false },
];

const interactiveSteps: AppStepperStep[] = [
  { name: 'Step 1', validated: true, error: false },
  { name: 'Step 2', validated: false, error: false },
  { name: 'Step 3', validated: false, error: false },
];

const interactiveSlides = [
  {
    title: 'First Slide',
    content: 'This is the first interactive slide.',
    bgClass: 'bg-primary',
  },
  {
    title: 'Second Slide',
    content: 'This is the second interactive slide.',
    bgClass: 'bg-success',
  },
  {
    title: 'Third Slide',
    content: 'This is the third interactive slide.',
    bgClass: 'bg-warning',
  },
];

const onSlideChange = (details: AppSliderSlideEventDetails) => {
  console.log('Slide changed:', details);
};

const onInteractiveSlideChange = (details: AppSliderSlideEventDetails) => {
  currentInteractiveSlide.value = details.slideNumber;
  lastSlideEvent.value = `Slide ${details.slideNumber + 1} (from ${details.oldSlideNumber + 1})`;
};
</script>

<template>
  <Story title="Navigation/AppSlider">
    <!-- Basic Usage with Arrow Navigation -->
    <Variant
      title="Basic Usage"
      description="Simple slider with arrow navigation"
    >
      <AppSlider @slide="onSlideChange">
        <template #slides>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-primary p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Slide 1</h3>
                <p>This is the first slide with some content.</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-success p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Slide 2</h3>
                <p>This is the second slide with different content.</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-danger p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Slide 3</h3>
                <p>This is the third slide with more content.</p>
              </div>
            </div>
          </AppSlide>
        </template>
        <template
          #navigation="{ activeSlide, slideCount, nextSlide, prevSlide }"
        >
          <div class="mt-4 flex items-center justify-center space-x-4">
            <button
              @click="() => prevSlide()"
              class="rounded bg-grey-dark px-3 py-1 text-sm text-white hover:bg-grey-darker"
            >
              ← Prev
            </button>
            <span class="text-sm text-grey-dark"
              >{{ activeSlide + 1 }} / {{ slideCount }}</span
            >
            <button
              @click="() => nextSlide()"
              class="rounded bg-grey-dark px-3 py-1 text-sm text-white hover:bg-grey-darker"
            >
              Next →
            </button>
          </div>
        </template>
      </AppSlider>
    </Variant>

    <!-- With Stepper Navigation -->
    <Variant
      title="With Stepper Navigation"
      description="Slider with integrated stepper and step controls"
    >
      <AppSlider :steps="steps" @slide="onSlideChange">
        <template #slides>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-primary-70 p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Introduction</h3>
                <p>Welcome to our multi-step process.</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-warning p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Information</h3>
                <p>Please provide your information here.</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-success p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Conclusion</h3>
                <p>Finally, we conclude with the key takeaways.</p>
              </div>
            </div>
          </AppSlide>
        </template>
        <template
          #navigation="{ activeSlide, slideCount, nextSlide, prevSlide }"
        >
          <div class="mt-4 flex justify-center space-x-2">
            <button
              @click="() => prevSlide()"
              :disabled="activeSlide === 0"
              class="rounded bg-primary px-4 py-2 text-white hover:bg-primary-70 disabled:cursor-not-allowed disabled:bg-grey-light"
            >
              Back
            </button>
            <button
              @click="() => nextSlide()"
              :disabled="activeSlide === slideCount - 1"
              class="rounded bg-primary px-4 py-2 text-white hover:bg-primary-70 disabled:cursor-not-allowed disabled:bg-grey-light"
            >
              Continue
            </button>
          </div>
        </template>
      </AppSlider>
    </Variant>

    <!-- Infinite Scrolling with Dots -->
    <Variant
      title="Infinite Scrolling"
      description="Slider with infinite loop and dot navigation"
    >
      <AppSlider :infinite="true" @slide="onSlideChange">
        <template #slides>
          <AppSlide v-for="n in 5" :key="n">
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-link p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Slide {{ n }}</h3>
                <p>This slider loops infinitely through {{ 5 }} slides.</p>
              </div>
            </div>
          </AppSlide>
        </template>
        <template
          #navigation="{
            activeSlide,
            slideCount,
            toSlide,
            nextSlide,
            prevSlide,
          }"
        >
          <div class="mt-4 flex items-center justify-center space-x-4">
            <button
              @click="() => prevSlide()"
              class="text-2xl text-link hover:text-link-70"
            >
              ‹
            </button>
            <div class="flex space-x-1">
              <button
                v-for="n in slideCount"
                :key="n"
                @click="() => toSlide(n - 1)"
                :class="[
                  'h-3 w-3 rounded-full transition-colors',
                  activeSlide === n - 1
                    ? 'bg-link'
                    : 'bg-grey-light hover:bg-link-30',
                ]"
              />
            </div>
            <button
              @click="() => nextSlide()"
              class="text-2xl text-link hover:text-link-70"
            >
              ›
            </button>
          </div>
        </template>
      </AppSlider>
    </Variant>

    <!-- Card-style Navigation -->
    <Variant
      title="Card-style Navigation"
      description="Slider with card-based navigation tabs"
    >
      <AppSlider @slide="onSlideChange">
        <template #slides>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-danger p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Feature 1</h3>
                <p>Discover our first amazing feature.</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-link p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Feature 2</h3>
                <p>Learn about our second great feature.</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-warning p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Feature 3</h3>
                <p>Explore our third powerful feature.</p>
              </div>
            </div>
          </AppSlide>
        </template>
        <template #navigation="{ activeSlide, slideCount, toSlide }">
          <div class="mt-6">
            <div class="mb-2 flex items-center justify-between">
              <h4 class="font-semibold text-grey-dark">Our Features</h4>
              <span class="text-sm text-grey"
                >{{ activeSlide + 1 }} of {{ slideCount }}</span
              >
            </div>
            <div class="flex space-x-2">
              <button
                v-for="(title, index) in [
                  'Feature 1',
                  'Feature 2',
                  'Feature 3',
                ]"
                :key="index"
                @click="() => toSlide(index)"
                :class="[
                  'flex-1 rounded p-3 text-left text-sm transition-colors',
                  activeSlide === index
                    ? 'border-2 border-primary bg-primary-10 text-primary-70'
                    : 'border-transparent border-2 bg-grey-lighter text-grey-dark hover:bg-grey-light',
                ]"
              >
                {{ title }}
              </button>
            </div>
          </div>
        </template>
      </AppSlider>
    </Variant>

    <!-- Image Gallery with Thumbnails -->
    <Variant
      title="Image Gallery"
      description="Image slider with thumbnail navigation"
    >
      <AppSlider @slide="onSlideChange">
        <template #slides>
          <AppSlide>
            <div
              class="flex min-h-[250px] items-center justify-center rounded-lg bg-grey-lighter p-4"
            >
              <div class="text-center">
                <div
                  class="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-lg bg-primary text-xl font-bold text-white"
                >
                  IMG 1
                </div>
                <p class="text-grey-dark">Sample Image 1</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[250px] items-center justify-center rounded-lg bg-grey-lighter p-4"
            >
              <div class="text-center">
                <div
                  class="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-lg bg-success text-xl font-bold text-white"
                >
                  IMG 2
                </div>
                <p class="text-grey-dark">Sample Image 2</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[250px] items-center justify-center rounded-lg bg-grey-lighter p-4"
            >
              <div class="text-center">
                <div
                  class="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-lg bg-danger text-xl font-bold text-white"
                >
                  IMG 3
                </div>
                <p class="text-grey-dark">Sample Image 3</p>
              </div>
            </div>
          </AppSlide>
        </template>
        <template
          #navigation="{
            activeSlide,
            slideCount,
            toSlide,
            nextSlide,
            prevSlide,
          }"
        >
          <div class="mt-4 space-y-3">
            <div class="flex justify-center space-x-2">
              <div
                v-for="n in slideCount"
                :key="n"
                @click="() => toSlide(n - 1)"
                :class="[
                  'flex h-12 w-16 cursor-pointer items-center justify-center rounded border-2 text-xs font-bold text-white transition-colors',
                  activeSlide === n - 1
                    ? 'border-primary opacity-100'
                    : 'border-grey-light opacity-60 hover:opacity-80',
                  n === 1 ? 'bg-primary' : n === 2 ? 'bg-success' : 'bg-danger',
                ]"
              >
                {{ n }}
              </div>
            </div>
            <div class="flex justify-center space-x-2">
              <button
                @click="() => prevSlide()"
                class="rounded bg-grey px-3 py-1 text-sm text-white hover:bg-grey-dark"
              >
                ‹ Prev
              </button>
              <button
                @click="() => nextSlide()"
                class="rounded bg-grey px-3 py-1 text-sm text-white hover:bg-grey-dark"
              >
                Next ›
              </button>
            </div>
          </div>
        </template>
      </AppSlider>
    </Variant>

    <!-- Interactive Example -->
    <Variant
      title="Interactive Example"
      description="Fully interactive slider with multiple controls"
    >
      <div class="space-y-4">
        <div class="mb-4 flex flex-wrap gap-4">
          <label class="flex items-center space-x-2">
            <input v-model="showStepper" type="checkbox" />
            <span>Show Stepper</span>
          </label>
          <label class="flex items-center space-x-2">
            <input v-model="infiniteLoop" type="checkbox" />
            <span>Infinite Loop</span>
          </label>
          <label class="flex items-center space-x-2">
            <input v-model="isDisabled" type="checkbox" />
            <span>Disabled</span>
          </label>
        </div>

        <AppSlider
          :steps="showStepper ? interactiveSteps : undefined"
          :infinite="infiniteLoop"
          :disabled="isDisabled"
          @slide="onInteractiveSlideChange"
        >
          <template #slides>
            <AppSlide v-for="(slide, index) in interactiveSlides" :key="index">
              <div
                :class="slide.bgClass"
                class="flex min-h-[200px] items-center justify-center rounded-lg p-8 text-center text-white"
              >
                <div>
                  <h3 class="mb-4 text-2xl font-bold">{{ slide.title }}</h3>
                  <p>{{ slide.content }}</p>
                </div>
              </div>
            </AppSlide>
          </template>
          <template
            #navigation="{
              activeSlide,
              slideCount,
              toSlide,
              nextSlide,
              prevSlide,
            }"
          >
            <div class="mt-4 space-y-2">
              <div class="flex justify-center space-x-2">
                <button
                  @click="() => prevSlide()"
                  :disabled="isDisabled"
                  class="rounded bg-success px-4 py-2 text-white hover:bg-success-70 disabled:bg-grey-light"
                >
                  Previous
                </button>
                <select
                  :value="activeSlide"
                  @change="
                    (e) =>
                      toSlide(parseInt((e.target as HTMLSelectElement).value))
                  "
                  :disabled="isDisabled"
                  class="rounded border px-3 py-2 disabled:bg-grey-lighter"
                >
                  <option
                    v-for="(slide, index) in interactiveSlides"
                    :key="index"
                    :value="index"
                  >
                    {{ slide.title }}
                  </option>
                </select>
                <button
                  @click="() => nextSlide()"
                  :disabled="isDisabled"
                  class="rounded bg-success px-4 py-2 text-white hover:bg-success-70 disabled:bg-grey-light"
                >
                  Next
                </button>
              </div>
              <div class="text-center">
                <div class="inline-flex space-x-1">
                  <div
                    v-for="n in slideCount"
                    :key="n"
                    :class="[
                      'h-2 w-2 rounded-full',
                      activeSlide === n - 1 ? 'bg-success' : 'bg-grey-light',
                    ]"
                  />
                </div>
              </div>
            </div>
          </template>
        </AppSlider>

        <div class="mt-4 rounded-lg bg-grey-lighter p-4">
          <h4 class="mb-2 font-semibold">Current State:</h4>
          <p>
            Current Slide: {{ currentInteractiveSlide + 1 }} /
            {{ interactiveSlides.length }}
          </p>
          <p>Last Event: {{ lastSlideEvent }}</p>
        </div>
      </div>
    </Variant>

    <!-- Disabled Slider -->
    <Variant
      title="Disabled Slider"
      description="Slider with disabled state and keyboard navigation info"
    >
      <div class="mb-4 space-y-2">
        <p class="text-sm text-grey-dark">
          <strong>Keyboard Navigation:</strong> Focus the slider and use Arrow
          Left/Right, Home, End keys to navigate
        </p>
        <p class="text-sm text-grey-dark">
          <strong>Disabled:</strong> The slider below is disabled to show the
          difference
        </p>
      </div>

      <AppSlider disabled @slide="onSlideChange">
        <template #slides>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-grey-light p-8 text-center text-grey-dark"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Disabled Slide 1</h3>
                <p>This slider is disabled and cannot be navigated.</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-grey-light p-8 text-center text-grey-dark"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Disabled Slide 2</h3>
                <p>Navigation is blocked when disabled prop is true.</p>
              </div>
            </div>
          </AppSlide>
        </template>
        <template
          #navigation="{ activeSlide, slideCount, nextSlide, prevSlide }"
        >
          <div class="mt-4 flex justify-center space-x-2">
            <button
              class="cursor-not-allowed rounded bg-grey-light px-4 py-2 text-grey-dark opacity-50"
              disabled
            >
              Previous
            </button>
            <span class="px-4 py-2"
              >{{ activeSlide + 1 }} / {{ slideCount }}</span
            >
            <button
              class="cursor-not-allowed rounded bg-grey-light px-4 py-2 text-grey-dark opacity-50"
              disabled
            >
              Next
            </button>
          </div>
        </template>
      </AppSlider>
    </Variant>

    <!-- Keyboard Navigation Demo -->
    <Variant
      title="Keyboard Navigation"
      description="Interactive slider demonstrating keyboard navigation"
    >
      <div class="mb-4 space-y-2">
        <p class="text-sm text-grey-dark">
          <strong>Instructions:</strong> Click on the slider to focus it, then
          use keyboard navigation
        </p>
        <div class="flex flex-wrap gap-2 text-sm">
          <kbd class="rounded bg-grey-light px-2 py-1">←</kbd>
          <span>Previous</span>
          <kbd class="rounded bg-grey-light px-2 py-1">→</kbd>
          <span>Next</span>
          <kbd class="rounded bg-grey-light px-2 py-1">Home</kbd>
          <span>First</span>
          <kbd class="rounded bg-grey-light px-2 py-1">End</kbd>
          <span>Last</span>
        </div>
      </div>

      <AppSlider @slide="onSlideChange">
        <template #slides>
          <AppSlide>
            <div
              class="bg-info flex min-h-[200px] items-center justify-center rounded-lg p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Keyboard Navigation</h3>
                <p>Use arrow keys to navigate between slides.</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-success p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Home/End Keys</h3>
                <p>Use Home/End to jump to first/last slide.</p>
              </div>
            </div>
          </AppSlide>
          <AppSlide>
            <div
              class="flex min-h-[200px] items-center justify-center rounded-lg bg-warning p-8 text-center text-white"
            >
              <div>
                <h3 class="mb-4 text-2xl font-bold">Accessible</h3>
                <p>Keyboard navigation improves accessibility.</p>
              </div>
            </div>
          </AppSlide>
        </template>
      </AppSlider>
    </Variant>
  </Story>
</template>
