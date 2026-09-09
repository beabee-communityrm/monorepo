/* eslint-disable @typescript-eslint/no-explicit-any */
import { Formio } from 'formiojs';

import { i18n } from '#lib/i18n';

// formiojs doesn't ship a working ESM/CJS-interop deep import for individual
// component classes, so we pull the file component off the same registry
// `Formio.Components.addComponent` writes into (see apps/frontend/src/lib/formio.ts) -
// this is populated as a side effect of importing 'formiojs' itself.
const FileComponent = (Formio as any).Components.components.file;

const { t } = i18n.global;

// Comfortably under the 20MB global upload cap at typical opus bitrates.
const MAX_RECORDING_DURATION_MS = 3 * 60 * 1000;
const MAX_RECORDING_DURATION_S = MAX_RECORDING_DURATION_MS / 1000;
const WAVEFORM_BAR_COUNT = 64;

// Checked in order of preference; the browser picks the first it supports.
// Chrome/Firefox support webm/opus, Safari only supports mp4.
const RECORDER_MIME_TYPES = [
  { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
  { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
  { mimeType: 'audio/mp4', extension: 'm4a' },
];

function extensionForMimeType(mimeType: string): string {
  const match = RECORDER_MIME_TYPES.find(({ mimeType: candidate }) =>
    mimeType.startsWith(candidate.split(';')[0])
  );
  return match?.extension ?? 'webm';
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function formatSize(bytes: number): string {
  const kb = Math.max(1, Math.round(bytes / 1024));
  return kb > 999 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB';
}

// Deterministic pseudo-random waveform derived from a filename, used when we
// have no real captured samples (an uploaded file, or a previously-saved
// answer being reloaded).
function fakePeaks(seed: string): number[] {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n += seed.charCodeAt(i);
  return Array.from({ length: WAVEFORM_BAR_COUNT }, (_, i) => {
    n = (n * 1103515245 + 12345) % 2147483648;
    return 0.2 + (n / 2147483648) * 0.8 * (0.55 + 0.45 * Math.sin(i / 5));
  });
}

type Phase =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'paused'
  | 'uploading'
  | 'ready'
  | 'error';

interface FormioFileValue {
  url: string;
  name: string;
  originalName?: string;
  size: number;
}

/**
 * FormIO component that lets a respondent either record audio directly in
 * the browser or upload an existing audio file. Extends the stock file
 * component to reuse its upload/status/validation machinery - recorded or
 * selected audio is fed through the same `upload()` method the stock
 * browse/drag-drop UI uses, but the entire visual presentation (idle,
 * requesting mic permission, live recording with a waveform, uploading,
 * attached/playback, error) is custom.
 */
export default class AudioRecorderComponent extends FileComponent {
  // Inherited from FileComponent/Component, which are untyped - declared here
  // so these type-check without casts.
  declare addEventListener: (
    obj: HTMLElement,
    event: string,
    handler: (event: Event) => void
  ) => void;
  declare upload: (files: File[]) => void;
  declare on: (event: string, handler: (...args: any[]) => void) => void;
  declare hasValue: () => boolean;
  declare dataValue: FormioFileValue[];
  declare statuses: Array<{ status: string; message?: string }>;
  declare refs: { fileProcessingLoader?: HTMLElement };
  declare options: { readOnly?: boolean };

  private phase: Phase = 'idle';

  // Recording session state
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private recordingTimeout: ReturnType<typeof setTimeout> | null = null;
  private elapsedInterval: ReturnType<typeof setInterval> | null = null;
  private elapsedMs = 0;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sampleBuf: Uint8Array<ArrayBuffer> | null = null;
  private sampleRaf: number | null = null;
  private lastSampleAt = 0;
  private livePeaks: number[] = [];

  // Attached/ready state
  private reviewPeaks: number[] = [];
  private duration = 0;
  private fileName = '';
  private fileMeta = '';
  private currentUrl: string | undefined;
  private playbackAudio: HTMLAudioElement | null = null;
  private playing = false;
  private playT = 0;

  // Error state
  private errorTitle = '';
  private errorBody = '';

  // DOM refs built once in attach()
  private idleBlock: HTMLElement | null = null;
  private requestingBlock: HTMLElement | null = null;
  private liveBlock: HTMLElement | null = null;
  private uploadingBlock: HTMLElement | null = null;
  private readyBlock: HTMLElement | null = null;
  private errorBlock: HTMLElement | null = null;

  private liveDot: HTMLElement | null = null;
  private liveStatusLabel: HTMLElement | null = null;
  private liveTimeLabel: HTMLElement | null = null;
  private liveMaxTimeLabel: HTMLElement | null = null;
  private liveBars: HTMLElement[] = [];
  private pauseButton: HTMLButtonElement | null = null;
  private resumeButton: HTMLButtonElement | null = null;
  private remainingLabel: HTMLElement | null = null;

  private uploadingFileName: HTMLElement | null = null;

  private readyMeta: HTMLElement | null = null;
  private playButton: HTMLButtonElement | null = null;
  private playIcon: HTMLElement | null = null;
  private reviewBars: HTMLElement[] = [];
  private playLabel: HTMLElement | null = null;
  private readyFileName: HTMLElement | null = null;

  private errorTitleEl: HTMLElement | null = null;
  private errorBodyEl: HTMLElement | null = null;

  // FileComponent's own upload() calls this.redraw() several times over the
  // life of a single upload (destroy + render + attach on this same
  // instance) - attach() must stay idempotent across those re-entries: only
  // derive the initial phase once, and only register these listeners once.
  private hasAttachedBefore = false;
  private listenersRegistered = false;

  static schema(...extend: any[]) {
    return FileComponent.schema(
      {
        type: 'audiorecorder',
        label: 'Audio Recording',
        key: 'audioRecorder',
        storage: 'beabee',
        filePattern: 'audio/*',
        fileMaxSize: '20MB',
        multiple: false,
      },
      ...extend
    );
  }

  // FileComponent hardcodes `defaultSchema` to `FileComponent.schema()`
  // (not `this.constructor.schema()`), so without this override our schema()
  // overrides (filePattern, label, ...) never get merged in at runtime.
  get defaultSchema() {
    return AudioRecorderComponent.schema();
  }

  static get builderInfo() {
    return {
      title: 'Audio Recording',
      group: 'basic',
      icon: 'microphone',
      weight: 100,
      schema: AudioRecorderComponent.schema(),
    };
  }

  attach(element: HTMLElement) {
    const superAttach = super.attach(element);

    // Read-only rendering (e.g. viewing a submitted response) shows the
    // recorded/uploaded answer as a plain player, not the interactive
    // record-or-upload UI.
    if (this.options?.readOnly) {
      element.prepend(this.buildReadOnlyUi());
      return superAttach;
    }

    if (!this.listenersRegistered) {
      this.listenersRegistered = true;
      this.on('fileUploadingStart', () => this.setPhase('uploading'));
      this.on('fileUploadingEnd', () => {
        if (this.hasValue() && this.dataValue?.length) {
          this.enterReadyPhase();
        } else {
          const failed = this.statuses.find((s) => s.status === 'error');
          this.showError(
            t('form.errors.audio.uploadFailedTitle'),
            failed?.message || t('form.errors.file.uploadFailed')
          );
        }
      });
    }

    element.prepend(this.buildUi());

    if (!this.hasAttachedBefore) {
      this.hasAttachedBefore = true;
      if (this.hasValue() && this.dataValue?.length) {
        this.enterReadyPhase();
      } else {
        this.setPhase('idle');
      }
    } else {
      // Re-entered via a formio-internal redraw (e.g. mid-upload) - the DOM
      // was just rebuilt from scratch, so re-apply whatever phase we were
      // already in rather than re-deriving it (dataValue can be transiently
      // empty mid-upload even though we're not back to idle).
      this.setPhase(this.phase);
    }

    return superAttach;
  }

  destroy() {
    this.stopElapsedTimer();
    this.stopWaveformSampling();
    this.stopMediaStream();
    this.closeAudioContext();
    if (this.recordingTimeout) clearTimeout(this.recordingTimeout);
    if (this.playbackAudio) this.playbackAudio.pause();
    super.destroy();
  }

  // ---------------------------------------------------------------------
  // UI construction (built once; visibility toggled per phase)
  // ---------------------------------------------------------------------

  private buildUi(): HTMLElement {
    const root = document.createElement('div');
    root.className = 'audio-recorder';

    this.idleBlock = this.buildIdleBlock();
    this.requestingBlock = this.buildRequestingBlock();
    this.liveBlock = this.buildLiveBlock();
    this.uploadingBlock = this.buildUploadingBlock();
    this.readyBlock = this.buildReadyBlock();
    this.errorBlock = this.buildErrorBlock();

    root.append(
      this.idleBlock,
      this.requestingBlock,
      this.liveBlock,
      this.uploadingBlock,
      this.readyBlock,
      this.errorBlock
    );
    return root;
  }

  private buildIdleBlock(): HTMLElement {
    const block = document.createElement('div');
    block.className = 'audio-recorder-panel audio-recorder-idle';

    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.className = 'audio-recorder-btn-primary';
    startButton.innerHTML = '<span class="audio-recorder-dot"></span>';
    startButton.append(
      document.createTextNode(t('formRenderer.components.audioRecorder.record'))
    );
    this.addEventListener(startButton, 'click', (event) => {
      event.preventDefault();
      this.startRecording();
    });

    const or = document.createElement('span');
    or.className = 'audio-recorder-or';
    or.textContent = t('formRenderer.components.file.or');

    const uploadLabel = document.createElement('label');
    uploadLabel.className = 'audio-recorder-link';
    uploadLabel.append(
      document.createTextNode(
        t('formRenderer.components.audioRecorder.uploadLabel')
      )
    );
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.accept = 'audio/*';
    uploadInput.className = 'audio-recorder-file-input';
    this.addEventListener(uploadInput, 'change', (event) =>
      this.onFileSelected(event)
    );
    uploadLabel.append(uploadInput);

    const formats = document.createElement('span');
    formats.className = 'audio-recorder-formats';
    formats.textContent = t(
      'formRenderer.components.audioRecorder.uploadFormats'
    );

    block.append(startButton, or, uploadLabel, formats);
    return block;
  }

  private buildRequestingBlock(): HTMLElement {
    const block = document.createElement('div');
    block.className = 'audio-recorder-panel audio-recorder-requesting';
    const spinner = document.createElement('span');
    spinner.className = 'audio-recorder-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.textContent = t(
      'formRenderer.components.audioRecorder.requestingPermission'
    );
    block.append(spinner, label);
    return block;
  }

  private buildLiveBlock(): HTMLElement {
    const block = document.createElement('div');
    block.className = 'audio-recorder-panel audio-recorder-live';

    const row = document.createElement('div');
    row.className = 'audio-recorder-live-row';
    this.liveDot = document.createElement('span');
    this.liveDot.className = 'audio-recorder-rec-dot';
    this.liveStatusLabel = document.createElement('span');
    this.liveStatusLabel.className = 'audio-recorder-live-status';
    this.liveTimeLabel = document.createElement('span');
    this.liveTimeLabel.className = 'audio-recorder-live-time';
    this.liveMaxTimeLabel = document.createElement('span');
    this.liveMaxTimeLabel.className = 'audio-recorder-live-max-time';
    this.liveMaxTimeLabel.textContent =
      '/ ' + formatTime(MAX_RECORDING_DURATION_S);
    row.append(
      this.liveDot,
      this.liveStatusLabel,
      this.liveTimeLabel,
      this.liveMaxTimeLabel
    );

    const { container: barsContainer, bars } = this.createBars(
      'audio-recorder-live-bars'
    );
    this.liveBars = bars;

    const controls = document.createElement('div');
    controls.className = 'audio-recorder-live-controls';

    this.pauseButton = document.createElement('button');
    this.pauseButton.type = 'button';
    this.pauseButton.className = 'audio-recorder-btn-outline';
    this.pauseButton.textContent = t(
      'formRenderer.components.audioRecorder.pause'
    );
    this.addEventListener(this.pauseButton, 'click', (event) => {
      event.preventDefault();
      this.pauseRecording();
    });

    this.resumeButton = document.createElement('button');
    this.resumeButton.type = 'button';
    this.resumeButton.className = 'audio-recorder-btn-outline';
    this.resumeButton.textContent = t(
      'formRenderer.components.audioRecorder.resume'
    );
    this.addEventListener(this.resumeButton, 'click', (event) => {
      event.preventDefault();
      this.resumeRecording();
    });

    const stopButton = document.createElement('button');
    stopButton.type = 'button';
    stopButton.className = 'audio-recorder-btn-primary';
    stopButton.innerHTML = '<span class="audio-recorder-stop-icon"></span>';
    stopButton.append(
      document.createTextNode(t('formRenderer.components.audioRecorder.stop'))
    );
    this.addEventListener(stopButton, 'click', (event) => {
      event.preventDefault();
      this.stopRecording();
    });

    const discardButton = document.createElement('button');
    discardButton.type = 'button';
    discardButton.className = 'audio-recorder-link audio-recorder-discard';
    discardButton.textContent = t(
      'formRenderer.components.audioRecorder.discard'
    );
    this.addEventListener(discardButton, 'click', (event) => {
      event.preventDefault();
      this.discard();
    });

    controls.append(
      this.pauseButton,
      this.resumeButton,
      stopButton,
      discardButton
    );

    this.remainingLabel = document.createElement('p');
    this.remainingLabel.className = 'audio-recorder-remaining';

    block.append(row, barsContainer, controls, this.remainingLabel);
    return block;
  }

  private buildUploadingBlock(): HTMLElement {
    const block = document.createElement('div');
    block.className = 'audio-recorder-panel audio-recorder-uploading';

    const row = document.createElement('div');
    row.className = 'audio-recorder-uploading-row';
    this.uploadingFileName = document.createElement('span');
    this.uploadingFileName.className = 'audio-recorder-filename';
    const spinner = document.createElement('span');
    spinner.className = 'audio-recorder-spinner audio-recorder-spinner--small';
    spinner.setAttribute('aria-hidden', 'true');
    row.append(this.uploadingFileName, spinner);

    const hint = document.createElement('p');
    hint.className = 'audio-recorder-hint';
    hint.textContent = t('formRenderer.components.audioRecorder.uploadingHint');

    block.append(row, hint);
    return block;
  }

  private buildReadyBlock(): HTMLElement {
    const block = document.createElement('div');
    block.className = 'audio-recorder-panel audio-recorder-ready';

    const row = document.createElement('div');
    row.className = 'audio-recorder-ready-row';
    const badge = document.createElement('span');
    badge.className = 'audio-recorder-badge';
    badge.textContent = t('formRenderer.components.audioRecorder.attached');
    this.readyMeta = document.createElement('span');
    this.readyMeta.className = 'audio-recorder-meta';
    row.append(badge, this.readyMeta);

    const playRow = document.createElement('div');
    playRow.className = 'audio-recorder-play-row';

    this.playButton = document.createElement('button');
    this.playButton.type = 'button';
    this.playButton.className = 'audio-recorder-play-button';
    this.playButton.setAttribute(
      'aria-label',
      t('formRenderer.components.audioRecorder.playPause')
    );
    this.playIcon = document.createElement('span');
    this.playIcon.textContent = '▶';
    this.playButton.append(this.playIcon);
    this.addEventListener(this.playButton, 'click', (event) => {
      event.preventDefault();
      this.togglePlay();
    });

    const { container: barsContainer, bars } = this.createBars(
      'audio-recorder-review-bars'
    );
    this.reviewBars = bars;

    this.playLabel = document.createElement('span');
    this.playLabel.className = 'audio-recorder-play-label';

    playRow.append(this.playButton, barsContainer, this.playLabel);

    const footer = document.createElement('div');
    footer.className = 'audio-recorder-ready-footer';
    this.readyFileName = document.createElement('span');
    this.readyFileName.className = 'audio-recorder-filename';

    const reRecordButton = document.createElement('button');
    reRecordButton.type = 'button';
    reRecordButton.className = 'audio-recorder-link';
    reRecordButton.textContent = t(
      'formRenderer.components.audioRecorder.reRecord'
    );
    this.addEventListener(reRecordButton, 'click', (event) => {
      event.preventDefault();
      this.discard();
      this.startRecording();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'audio-recorder-link audio-recorder-discard';
    deleteButton.textContent = t(
      'formRenderer.components.audioRecorder.delete'
    );
    this.addEventListener(deleteButton, 'click', (event) => {
      event.preventDefault();
      this.discard();
    });

    footer.append(this.readyFileName, reRecordButton, deleteButton);

    block.append(row, playRow, footer);
    return block;
  }

  private buildErrorBlock(): HTMLElement {
    const block = document.createElement('div');
    block.className = 'audio-recorder-panel audio-recorder-error';

    const row = document.createElement('div');
    row.className = 'audio-recorder-error-row';
    const icon = document.createElement('span');
    icon.className = 'audio-recorder-error-icon';
    icon.textContent = '!';
    this.errorTitleEl = document.createElement('span');
    this.errorTitleEl.className = 'audio-recorder-error-title';
    row.append(icon, this.errorTitleEl);

    this.errorBodyEl = document.createElement('p');
    this.errorBodyEl.className = 'audio-recorder-error-body';

    const actions = document.createElement('div');
    actions.className = 'audio-recorder-error-actions';

    const tryAgainButton = document.createElement('button');
    tryAgainButton.type = 'button';
    tryAgainButton.className = 'audio-recorder-btn-primary';
    tryAgainButton.textContent = t(
      'formRenderer.components.audioRecorder.tryAgain'
    );
    this.addEventListener(tryAgainButton, 'click', (event) => {
      event.preventDefault();
      this.startRecording();
    });

    const uploadLabel = document.createElement('label');
    uploadLabel.className = 'audio-recorder-link';
    uploadLabel.append(
      document.createTextNode(
        t('formRenderer.components.audioRecorder.uploadInstead')
      )
    );
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.accept = 'audio/*';
    uploadInput.className = 'audio-recorder-file-input';
    this.addEventListener(uploadInput, 'change', (event) =>
      this.onFileSelected(event)
    );
    uploadLabel.append(uploadInput);

    actions.append(tryAgainButton, uploadLabel);

    block.append(row, this.errorBodyEl, actions);
    return block;
  }

  private buildReadOnlyUi(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'audio-recorder-readonly';

    const value = this.dataValue?.[this.dataValue.length - 1];
    if (!value?.url) return container;

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = value.url;
    audio.className = 'audio-recorder-readonly-player';

    const fileName = document.createElement('p');
    fileName.className = 'audio-recorder-filename';
    fileName.textContent = value.originalName || value.name || '';

    container.append(audio, fileName);
    return container;
  }

  private createBars(containerClass: string): {
    container: HTMLElement;
    bars: HTMLElement[];
  } {
    const container = document.createElement('div');
    container.className = containerClass;
    const bars: HTMLElement[] = [];
    for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
      const bar = document.createElement('div');
      bar.className = 'audio-recorder-bar';
      container.append(bar);
      bars.push(bar);
    }
    return { container, bars };
  }

  // ---------------------------------------------------------------------
  // Phase management
  // ---------------------------------------------------------------------

  private setPhase(phase: Phase) {
    this.phase = phase;
    const blocks: Record<Phase, HTMLElement | null> = {
      idle: this.idleBlock,
      requesting: this.requestingBlock,
      recording: this.liveBlock,
      paused: this.liveBlock,
      uploading: this.uploadingBlock,
      ready: this.readyBlock,
      error: this.errorBlock,
    };
    for (const block of [
      this.idleBlock,
      this.requestingBlock,
      this.liveBlock,
      this.uploadingBlock,
      this.readyBlock,
      this.errorBlock,
    ]) {
      if (block) block.hidden = block !== blocks[phase];
    }

    if (phase === 'recording' || phase === 'paused') {
      this.updateLiveDynamic();
    } else if (phase === 'uploading') {
      if (this.uploadingFileName)
        this.uploadingFileName.textContent = this.fileName;
    } else if (phase === 'ready') {
      this.updateReadyDynamic();
    } else if (phase === 'error') {
      if (this.errorTitleEl) this.errorTitleEl.textContent = this.errorTitle;
      if (this.errorBodyEl) this.errorBodyEl.textContent = this.errorBody;
    }
  }

  private showError(title: string, body: string) {
    this.stopElapsedTimer();
    this.stopWaveformSampling();
    this.stopMediaStream();
    this.closeAudioContext();
    this.errorTitle = title;
    this.errorBody = body;
    if (this.errorTitleEl) this.errorTitleEl.textContent = title;
    if (this.errorBodyEl) this.errorBodyEl.textContent = body;
    this.setPhase('error');
  }

  // ---------------------------------------------------------------------
  // Recording
  // ---------------------------------------------------------------------

  private async startRecording() {
    this.setPhase('requesting');
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch {
      this.showError(
        t('form.errors.audio.micPermissionDeniedTitle'),
        t('form.errors.audio.micPermissionDeniedBody')
      );
      return;
    }

    try {
      const AudioContextCtor =
        window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextCtor();
      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 1024;
      source.connect(this.analyser);
      this.sampleBuf = new Uint8Array(this.analyser.fftSize);

      const preferred = RECORDER_MIME_TYPES.find(
        ({ mimeType }) =>
          typeof MediaRecorder !== 'undefined' &&
          MediaRecorder.isTypeSupported(mimeType)
      );
      this.mediaRecorder = preferred
        ? new MediaRecorder(this.mediaStream, { mimeType: preferred.mimeType })
        : new MediaRecorder(this.mediaStream);

      this.chunks = [];
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) this.chunks.push(event.data);
      });
      this.mediaRecorder.addEventListener('stop', () => this.finishRecording());
      this.mediaRecorder.start();
    } catch {
      this.stopMediaStream();
      this.closeAudioContext();
      this.showError(
        t('form.errors.audio.recordingNotSupportedTitle'),
        t('form.errors.audio.recordingNotSupportedBody')
      );
      return;
    }

    this.livePeaks = [];
    this.elapsedMs = 0;
    this.setPhase('recording');
    this.startElapsedTimer();
    this.sampleWaveform();

    this.recordingTimeout = setTimeout(() => {
      this.stopRecording();
    }, MAX_RECORDING_DURATION_MS);
  }

  private pauseRecording() {
    try {
      this.mediaRecorder?.pause();
    } catch {
      // ignore - pause is best-effort on browsers that support it
    }
    this.stopElapsedTimer();
    this.setPhase('paused');
  }

  private resumeRecording() {
    try {
      this.mediaRecorder?.resume();
    } catch {
      // ignore
    }
    this.setPhase('recording');
    this.startElapsedTimer();
  }

  private stopRecording() {
    this.stopElapsedTimer();
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }
    try {
      this.mediaRecorder?.stop();
    } catch {
      this.finishRecording();
    }
  }

  private finishRecording() {
    this.stopWaveformSampling();
    this.stopMediaStream();
    this.closeAudioContext();

    const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
    const extension = extensionForMimeType(mimeType);
    const blob = new Blob(this.chunks, { type: mimeType });
    const file = new File([blob], `recording-${Date.now()}.${extension}`, {
      type: mimeType,
    });

    this.duration = this.elapsedMs / 1000;
    this.reviewPeaks = this.livePeaks.length
      ? this.resampleLivePeaks()
      : fakePeaks(file.name);

    this.beginUpload(file);
  }

  private resampleLivePeaks(): number[] {
    const src = this.livePeaks;
    return Array.from(
      { length: WAVEFORM_BAR_COUNT },
      (_, i) => src[Math.floor((i * src.length) / WAVEFORM_BAR_COUNT)] ?? 0
    );
  }

  private stopMediaStream() {
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = null;
  }

  private closeAudioContext() {
    this.audioCtx?.close().catch(() => {});
    this.audioCtx = null;
    this.analyser = null;
  }

  private startElapsedTimer() {
    this.elapsedInterval = setInterval(() => {
      this.elapsedMs = Math.min(
        this.elapsedMs + 100,
        MAX_RECORDING_DURATION_MS
      );
      this.updateLiveDynamic();
      if (this.elapsedMs >= MAX_RECORDING_DURATION_MS) {
        this.stopRecording();
      }
    }, 100);
  }

  private stopElapsedTimer() {
    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval);
      this.elapsedInterval = null;
    }
  }

  private sampleWaveform = () => {
    if (this.phase === 'recording' && this.analyser && this.sampleBuf) {
      this.analyser.getByteTimeDomainData(this.sampleBuf);
      let peak = 0;
      for (let i = 0; i < this.sampleBuf.length; i++) {
        peak = Math.max(peak, Math.abs(this.sampleBuf[i] - 128) / 128);
      }
      const now = performance.now();
      if (now - this.lastSampleAt > 110) {
        this.lastSampleAt = now;
        this.livePeaks.push(peak);
        if (this.livePeaks.length > WAVEFORM_BAR_COUNT) this.livePeaks.shift();
        this.renderLiveBars();
      }
    }
    this.sampleRaf = requestAnimationFrame(this.sampleWaveform);
  };

  private stopWaveformSampling() {
    if (this.sampleRaf !== null) {
      cancelAnimationFrame(this.sampleRaf);
      this.sampleRaf = null;
    }
  }

  private renderLiveBars() {
    const offset = WAVEFORM_BAR_COUNT - this.livePeaks.length;
    for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
      const value = i >= offset ? this.livePeaks[i - offset] : undefined;
      const px = value == null ? 3 : Math.max(3, Math.min(60, value * 130));
      this.liveBars[i].style.height = px + 'px';
    }
  }

  private updateLiveDynamic() {
    const paused = this.phase === 'paused';
    if (this.liveDot) this.liveDot.hidden = paused;
    if (this.liveStatusLabel) {
      this.liveStatusLabel.textContent = t(
        paused
          ? 'formRenderer.components.audioRecorder.paused'
          : 'formRenderer.components.audioRecorder.recording'
      );
    }
    if (this.liveTimeLabel) {
      this.liveTimeLabel.textContent = formatTime(this.elapsedMs / 1000);
    }
    if (this.pauseButton) this.pauseButton.hidden = paused;
    if (this.resumeButton) this.resumeButton.hidden = !paused;
    if (this.remainingLabel) {
      const remaining = formatTime(
        (MAX_RECORDING_DURATION_MS - this.elapsedMs) / 1000
      );
      this.remainingLabel.textContent = t(
        'formRenderer.components.audioRecorder.remaining',
        { time: remaining }
      );
    }
  }

  // ---------------------------------------------------------------------
  // Upload a file directly, instead of recording
  // ---------------------------------------------------------------------

  private onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const probe = new Audio(objectUrl);

    const proceed = (duration: number) => {
      URL.revokeObjectURL(objectUrl);
      if (duration > MAX_RECORDING_DURATION_S) {
        this.showError(
          t('form.errors.audio.tooLongTitle'),
          t('form.errors.audio.tooLongBody', {
            duration: formatTime(duration),
            max: formatTime(MAX_RECORDING_DURATION_S),
          })
        );
        return;
      }
      this.duration = duration;
      this.reviewPeaks = fakePeaks(file.name);
      this.beginUpload(file);
    };

    probe.addEventListener('loadedmetadata', () => {
      proceed(isFinite(probe.duration) ? probe.duration : 0);
    });
    // Not every audio file the browser accepts can also be decoded for a
    // duration probe - still attempt the upload and let server-side
    // validation reject anything genuinely unsupported.
    probe.addEventListener('error', () => proceed(0));
  }

  private beginUpload(file: File) {
    this.fileName = file.name;
    this.setPhase('uploading');
    if (this.uploadingFileName) this.uploadingFileName.textContent = file.name;
    this.upload([file]);
  }

  // ---------------------------------------------------------------------
  // Ready / playback
  // ---------------------------------------------------------------------

  private enterReadyPhase() {
    const value = this.dataValue[this.dataValue.length - 1];
    this.fileName = value?.originalName || value?.name || '';
    this.currentUrl = value?.url;
    this.playT = 0;
    this.playing = false;
    if (this.playbackAudio) {
      this.playbackAudio.pause();
      this.playbackAudio = null;
    }

    if (this.duration && this.reviewPeaks.length) {
      this.fileMeta =
        formatTime(this.duration) + ' · ' + formatSize(value.size);
      this.setPhase('ready');
      return;
    }

    if (!this.currentUrl) {
      this.setPhase('ready');
      return;
    }

    const probe = new Audio(this.currentUrl);
    probe.addEventListener('loadedmetadata', () => {
      this.duration = isFinite(probe.duration) ? probe.duration : 0;
      this.reviewPeaks = fakePeaks(this.fileName || this.currentUrl || '');
      this.fileMeta =
        formatTime(this.duration) + ' · ' + formatSize(value.size);
      this.setPhase('ready');
    });
  }

  private updateReadyDynamic() {
    if (this.readyMeta) this.readyMeta.textContent = this.fileMeta;
    if (this.readyFileName) this.readyFileName.textContent = this.fileName;
    if (this.playIcon) this.playIcon.textContent = this.playing ? '❚❚' : '▶';

    const dur = this.duration || 1;
    const played = this.playT / dur;
    for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
      const source = this.reviewPeaks;
      const value = source.length
        ? source[Math.floor((i * source.length) / WAVEFORM_BAR_COUNT)]
        : 0.35;
      const height = Math.max(3, Math.min(48, value * 110));
      const bar = this.reviewBars[i];
      bar.style.height = height + 'px';
      bar.classList.toggle(
        'audio-recorder-bar--played',
        i / WAVEFORM_BAR_COUNT <= played
      );
    }

    if (this.playLabel) {
      this.playLabel.textContent = formatTime(
        this.playing || this.playT ? this.playT : dur
      );
    }
  }

  private togglePlay() {
    if (!this.currentUrl) return;
    if (!this.playbackAudio) {
      this.playbackAudio = new Audio(this.currentUrl);
      this.playbackAudio.addEventListener('timeupdate', () => {
        this.playT = this.playbackAudio?.currentTime ?? 0;
        this.updateReadyDynamic();
      });
      this.playbackAudio.addEventListener('ended', () => {
        this.playing = false;
        this.playT = 0;
        this.updateReadyDynamic();
      });
    }
    if (this.playing) {
      this.playbackAudio.pause();
      this.playing = false;
    } else {
      this.playbackAudio.play().catch(() => {});
      this.playing = true;
    }
    this.updateReadyDynamic();
  }

  private discard() {
    this.stopElapsedTimer();
    this.stopWaveformSampling();
    this.stopMediaStream();
    this.closeAudioContext();
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }
    if (this.playbackAudio) {
      this.playbackAudio.pause();
      this.playbackAudio = null;
    }
    this.dataValue = [];
    this.livePeaks = [];
    this.reviewPeaks = [];
    this.duration = 0;
    this.fileName = '';
    this.fileMeta = '';
    this.playT = 0;
    this.playing = false;
    this.setPhase('idle');
  }
}
