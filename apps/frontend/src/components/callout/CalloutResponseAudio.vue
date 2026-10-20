<!--
  # CalloutResponseAudio
  Plays back an audio answer, styled after the audio recorder's read-only view.
  The waveform is decorative: it's generated from the file's name, as the
  recorder does for any file it didn't capture itself.
-->
<template>
  <div class="flex flex-col gap-3 rounded-lg p-4 ring ring-default">
    <p v-if="meta" class="self-end text-sm text-muted">{{ meta }}</p>

    <div class="flex items-center gap-4">
      <UButton
        class="size-12 flex-none justify-center rounded-full"
        :icon="playing ? 'i-lucide-pause' : 'i-lucide-play'"
        :aria-label="t('formRenderer.components.audioRecorder.playPause')"
        :aria-pressed="playing"
        @click="togglePlay"
      />

      <div
        class="flex h-13 min-w-0 flex-1 items-end gap-0.5 overflow-hidden"
        aria-hidden="true"
      >
        <div
          v-for="(height, i) in barHeights"
          :key="i"
          class="min-w-px flex-1 rounded-sm"
          :class="
            isBarPlayed(i, currentTime, duration || 0)
              ? 'bg-primary'
              : 'bg-primary/20'
          "
          :style="{ height: `${height}px` }"
        />
      </div>

      <span class="flex-none font-bold text-primary tabular-nums">
        {{ formatPlaybackTime(playing, currentTime, duration || 0) }}
      </span>
    </div>

    <div class="flex items-center gap-4 border-t border-default pt-3">
      <span v-if="name" class="min-w-0 truncate text-muted">{{ name }}</span>
      <UButton
        variant="link"
        class="p-0"
        :to="src"
        target="_blank"
        rel="noopener"
      >
        {{ t('formRenderer.components.audioRecorder.download') }}
      </UButton>
    </div>

    <audio
      ref="audio"
      :src="src"
      preload="none"
      @play="playing = true"
      @pause="playing = false"
      @timeupdate="currentTime = audio?.currentTime ?? 0"
      @ended="currentTime = 0"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  fakePeaks,
  formatAudioMeta,
  formatPlaybackTime,
  isBarPlayed,
  waveformBarHeights,
} from '#utils/audio-playback';

/** Props for CalloutResponseAudio */
export interface CalloutResponseAudioProps {
  /** Where the audio is served from */
  src: string;
  /** The file's name, if it has one */
  name: string;
  /** The file's size in bytes */
  size?: number;
  /** The length in seconds, as saved at upload */
  duration?: number;
}

const props = defineProps<CalloutResponseAudioProps>();

const { t } = useI18n();

const audio = useTemplateRef('audio');
const playing = ref(false);
const currentTime = ref(0);

const meta = computed(() => formatAudioMeta(props.duration, props.size));

const barHeights = computed(() =>
  waveformBarHeights(fakePeaks(props.name || props.src))
);

function togglePlay() {
  if (audio.value?.paused) {
    audio.value.play().catch(() => {});
  } else {
    audio.value?.pause();
  }
}
</script>
