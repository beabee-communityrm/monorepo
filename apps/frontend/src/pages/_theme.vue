<route lang="yaml">
name: theme
meta:
  noAuth: true
  pageTitle: Theme settings
</route>
<template>
  <section class="my-5">
    <h2 class="mb-2 font-title text-2xl">Colours</h2>
    <div class="flex bg-white p-4">
      <div class="flex-1">
        <AppColor name="bg-primary" shade="Primary" />
        <AppColor name="bg-primary-5" shade="5" />
        <AppColor name="bg-primary-10" shade="10" />
        <AppColor name="bg-primary-20" shade="20" />
        <AppColor name="bg-primary-40" shade="40" />
        <AppColor name="bg-primary-70" shade="70" />
        <AppColor name="bg-primary-80" shade="80" />
      </div>
      <div class="flex-1">
        <AppColor name="bg-body" shade="Body" />
        <AppColor name="bg-body-40" shade="40" />
        <AppColor name="bg-body-80" shade="80" />
      </div>
      <div class="flex-1">
        <AppColor name="bg-link" shade="Link" />
        <AppColor name="bg-link-10" shade="10" />
        <AppColor name="bg-link-30" shade="30" />
        <AppColor name="bg-link-70" shade="70" />
        <AppColor name="bg-link-110" shade="110" />
      </div>
      <div class="flex-1">
        <AppColor name="bg-warning" shade="Warning" />
        <AppColor name="bg-warning-10" shade="10" />
        <AppColor name="bg-warning-30" shade="30" />
        <AppColor name="bg-warning-70" shade="70" />
      </div>
      <div class="flex-1">
        <AppColor name="bg-success" shade="Success" />
        <AppColor name="bg-success-10" shade="10" />
        <AppColor name="bg-success-30" shade="30" />
        <AppColor name="bg-success-70" shade="70" />
        <AppColor name="bg-success-110" shade="110" />
      </div>
      <div class="flex-1">
        <AppColor name="bg-danger" shade="Danger" />
        <AppColor name="bg-danger-10" shade="10" />
        <AppColor name="bg-danger-30" shade="30" />
        <AppColor name="bg-danger-70" shade="70" />
        <AppColor name="bg-danger-110" shade="110" />
      </div>
      <div class="flex-1">
        <AppColor name="bg-grey" shade="Grey" />
        <AppColor name="bg-grey-lighter" shade="Lighter" />
        <AppColor name="bg-grey-light" shade="Light" />
        <AppColor name="bg-grey-dark" shade="Dark" />
        <AppColor name="bg-grey-darker" shade="Darker" />
      </div>
    </div>
  </section>

  <section class="my-5">
    <h2 class="mb-2 font-title text-2xl">Components</h2>

    <section class="my-5">
      <h3 class="mb-2 font-title text-xl">Buttons</h3>
      <div class="flex flex-wrap bg-white p-4">
        <div class="m-2">
          <AppButton variant="primary">primary</AppButton>
        </div>
        <div class="m-2">
          <AppButton variant="link">link</AppButton>
        </div>
        <div class="m-2">
          <AppButton variant="danger">danger</AppButton>
        </div>
        <div class="m-2">
          <AppButton variant="primaryOutlined">primaryOutlined</AppButton>
        </div>
        <div class="m-2">
          <AppButton variant="linkOutlined">linkOutlined</AppButton>
        </div>
        <div class="m-2">
          <AppButton variant="dangerOutlined">dangerOutlined</AppButton>
        </div>
        <div class="m-2">
          <AppButton variant="text">text</AppButton>
        </div>
        <div class="m-2">
          <AppButton variant="dangerText">dangerText</AppButton>
        </div>
      </div>
    </section>

    <section class="my-5">
      <h3 class="mb-2 font-title text-xl">AppStepper</h3>
      <div class="bg-white p-4">
        <AppStepper
          v-model="appStepper.selectedStepIndex"
          :steps="appStepper.steps"
          class="justify-center"
        />
        <div
          v-for="(step, index) in appStepper.steps"
          v-show="index === appStepper.selectedStepIndex"
          :key="index"
          class="border-2 border-primary p-5"
        >
          <p>{{ index }}: {{ step.name }}</p>
          <AppCheckbox
            v-model="step.validated"
            label="validated"
            class="font-bold"
          />
          <AppCheckbox v-model="step.error" label="error" class="font-bold" />
        </div>
        <AppButton
          class="m-2"
          variant="primaryOutlined"
          @click="appStepper.selectedStepIndex--"
          >Back</AppButton
        >
        <AppButton
          class="m-2"
          variant="primary"
          @click="appStepper.selectedStepIndex++"
          >Next</AppButton
        >
      </div>
    </section>

    <section class="my-5">
      <h3 class="mb-2 font-title text-xl">
        AppSlider <small>with custom navigation</small>
      </h3>
      <div class="bg-white p-4">
        <div class="relative mx-auto max-w-[1200px]">
          <AppSlider :show-navigation-buttons="true" :infinite="true">
            <template #slides>
              <!-- Put your slides here -->
              <AppSlide>
                <img
                  class="mx-auto max-w-full"
                  src="https://picsum.photos/seed/1/1200/300"
                  alt="Lorem Picsum"
                />
              </AppSlide>
              <AppSlide class="bg-success">
                <div class="flex h-full w-full items-center justify-center">
                  <p>You can put anything you want in here!</p>
                </div>
              </AppSlide>
              <AppSlide>
                <img
                  class="mx-auto max-w-full"
                  src="https://picsum.photos/seed/2/1200/300"
                  alt="Lorem Picsum"
                />
              </AppSlide>
            </template>

            <!-- Define your custom navigation template here -->
            <template #navigation="{ nextSlide, prevSlide, toSlide }">
              <span class="absolute top-0 flex h-full w-full justify-between">
                <button class="" @click="prevSlide()">
                  <font-awesome-icon
                    class="p-2 text-2xl text-white hover:text-link"
                    :icon="faAngleLeft"
                  />
                </button>
                <button @click="nextSlide()">
                  <font-awesome-icon
                    class="p-2 text-2xl text-white hover:text-link"
                    :icon="faAngleRight"
                  />
                </button>
              </span>

              <button
                class="absolute left-0 top-0 p-2 text-2xl text-white hover:text-link"
                @click="toSlide(0)"
              >
                <font-awesome-icon :icon="faRotateBack" />
              </button>
            </template>
          </AppSlider>
        </div>
      </div>
    </section>

    <section class="my-5">
      <h3 class="mb-2 font-title text-xl">
        AppSlider <small>with AppStepper</small>
      </h3>
      <div class="bg-white p-4">
        <div class="relative mx-auto max-w-[1200px]">
          <AppSlider
            :show-navigation-buttons="true"
            :infinite="true"
            :steps="[
              { name: 'Step 1', validated: true, error: false },
              { name: 'Step 2', validated: false, error: true },
              { name: 'Step 3', validated: false, error: false },
            ]"
          >
            <template #slides>
              <!-- Put your slides here -->
              <AppSlide>
                <img
                  class="mx-auto max-w-full"
                  src="https://picsum.photos/seed/1/1200/300"
                  alt="Lorem Picsum"
                />
              </AppSlide>
              <AppSlide class="bg-success">
                <div class="flex h-full w-full items-center justify-center">
                  <p>You can put anything you want in here!</p>
                </div>
              </AppSlide>
              <AppSlide>
                <img
                  class="mx-auto max-w-full"
                  src="https://picsum.photos/seed/2/1200/300"
                  alt="Lorem Picsum"
                />
              </AppSlide>
            </template>
          </AppSlider>
        </div>
      </div>
    </section>

    <section class="my-5">
      <h3 class="mb-2 font-title text-xl">AppQRCode</h3>
      <div class="w-64 bg-white p-4">
        <AppQRCode :qr-data="appQRCode.data" />

        <p>Change the data to see the QR code change.</p>
        <AppInput
          v-model="appQRCode.data"
          label="Data"
          name="QR code data"
          required
        />
      </div>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import AppColor from '../components/AppColor.vue';
import AppButton from '../components/button/AppButton.vue';
import AppInput from '../components/forms/AppInput.vue';
import AppSlider from '../components/slider/AppSlider.vue';
import AppSlide from '../components/slider/AppSlide.vue';
import AppStepper from '../components/stepper/AppStepper.vue';
import AppCheckbox from '../components/forms/AppCheckbox.vue';
import AppQRCode from '../components/AppQRCode.vue';

import type { AppStepperStep } from '@type/app-stepper-step';

import {
  faAngleRight,
  faAngleLeft,
  faRotateBack,
} from '@fortawesome/free-solid-svg-icons';

const appStepper = ref({
  selectedStepIndex: 0,
  steps: [
    {
      name: 'Step 1',
      validated: true,
      error: false,
    },
    {
      name: 'Step 2',
      validated: false,
      error: false,
    },
    {
      name: 'Step 3',
      validated: false,
      error: false,
    },
  ] as AppStepperStep[],
});

const appQRCode = ref({
  data: "Take this! It's dangerous to go alone!",
});
</script>
