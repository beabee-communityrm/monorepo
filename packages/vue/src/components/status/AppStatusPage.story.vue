<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import AppStatusPage from './AppStatusPage.vue';

const state = reactive({
  title: 'Loading Application',
  message: 'Please wait while we prepare everything for you...',
  loadingText: 'Connecting to server',
  showProgress: false,
  progress: 0,
  progressText: 'Initializing...',
  showRetry: false,
  retryText: 'Try Again',
  showInfo: false,
  infoText: 'This usually takes just a few seconds.',
});

// Simulate progress for demo
const progressDemo = ref(0);
const isProgressing = ref(false);

function startProgress() {
  if (isProgressing.value) return;

  isProgressing.value = true;
  progressDemo.value = 0;

  const interval = setInterval(() => {
    progressDemo.value += Math.random() * 15;
    if (progressDemo.value >= 100) {
      progressDemo.value = 100;
      clearInterval(interval);
      setTimeout(() => {
        isProgressing.value = false;
      }, 1000);
    }
  }, 500);
}

// Auto-start progress demo on mount
onMounted(() => {
  setTimeout(startProgress, 1000);
});

function handleRetry() {
  console.log('Retry clicked');
  startProgress();
}

// Example scenarios
const scenarios = {
  loading: {
    title: 'Loading Application',
    message: 'Please wait while we prepare everything for you...',
    loadingText: 'Connecting to server',
    showProgress: false,
    showRetry: false,
    showInfo: true,
    infoText: 'This usually takes just a few seconds.',
  },
  withProgress: {
    title: 'Starting Services',
    message: 'Initializing application components...',
    loadingText: 'Setting up environment',
    showProgress: true,
    progress: 65,
    progressText: 'Loading configuration...',
    showRetry: false,
    showInfo: false,
  },
  withRetry: {
    title: 'Connection Issues',
    message: "We're having trouble connecting to the server.",
    loadingText: 'Retrying connection',
    showProgress: false,
    showRetry: true,
    retryText: 'Try Again',
    showInfo: true,
    infoText: 'Check your internet connection and try again.',
  },
  healthCheck: {
    title: 'Health Check',
    message: 'Verifying server status before launching...',
    loadingText: 'Checking services',
    showProgress: true,
    progress: 80,
    progressText: 'Database connectivity verified',
    showRetry: false,
    showInfo: true,
    infoText: 'Ensuring optimal performance.',
  },
};
</script>

<template>
  <Story title="Components/Status/AppStatusPage">
    <Variant title="Playground">
      <AppStatusPage
        :title="state.title"
        :message="state.message"
        :loading-text="state.loadingText"
        :show-progress="state.showProgress"
        :progress="state.progress"
        :progress-text="state.progressText"
        :show-retry="state.showRetry"
        :retry-text="state.retryText"
        :show-info="state.showInfo"
        :info-text="state.infoText"
        @retry="handleRetry"
      />

      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstText v-model="state.message" title="Message" />
        <HstText v-model="state.loadingText" title="Loading Text" />
        <HstCheckbox v-model="state.showProgress" title="Show Progress" />
        <HstNumber
          v-model="state.progress"
          title="Progress %"
          :min="0"
          :max="100"
        />
        <HstText v-model="state.progressText" title="Progress Text" />
        <HstCheckbox v-model="state.showRetry" title="Show Retry" />
        <HstText v-model="state.retryText" title="Retry Text" />
        <HstCheckbox v-model="state.showInfo" title="Show Info" />
        <HstText v-model="state.infoText" title="Info Text" />
      </template>
    </Variant>

    <Variant title="Basic Loading">
      <AppStatusPage v-bind="scenarios.loading" @retry="handleRetry" />
    </Variant>

    <Variant title="With Progress Bar">
      <AppStatusPage
        v-bind="scenarios.withProgress"
        :progress="progressDemo"
        @retry="handleRetry"
      />
    </Variant>

    <Variant title="With Retry Option">
      <AppStatusPage v-bind="scenarios.withRetry" @retry="handleRetry" />
    </Variant>

    <Variant title="Health Check Example">
      <AppStatusPage
        v-bind="scenarios.healthCheck"
        :progress="Math.min(progressDemo, 95)"
        @retry="handleRetry"
      />
    </Variant>

    <Variant title="All Features">
      <AppStatusPage
        title="Application Startup"
        message="Please wait while we initialize all components and verify connectivity..."
        loading-text="Performing health checks"
        :show-progress="true"
        :progress="progressDemo"
        progress-text="Connecting to backend services..."
        :show-retry="progressDemo >= 100"
        retry-text="Restart Process"
        :show-info="true"
        info-text="If this process takes longer than expected, try refreshing the page."
        @retry="handleRetry"
      />
    </Variant>
  </Story>
</template>
