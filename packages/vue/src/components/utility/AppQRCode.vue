<!--
  # AppQrCode
  A component that displays a QR code.

  ## Props
  - `qrData` (string): The data to encode in the QR code.
  - `typeNumber` (number): The type number (1 ~ 40), or 0 for auto detection. Defaults to 0.
  - `correctionLevel` (string): The error correction level. Defaults to 'H'.
-->

<template>
  <div ref="qrContainerEl" class="aspect-square w-full"></div>
</template>

<script lang="ts" setup>
// @ts-ignore
import { qrcode } from 'qrcode-generator/qrcode.mjs';
import { onMounted, ref, watch } from 'vue';

import type { AppQrCodeProps } from '../../types/qr-code';

/**
 * QR Code component for displaying encoded data as a QR code
 *
 * @example
 * ```vue
 * <AppQRCode
 *   qr-data="https://example.com"
 *   :type-number="0"
 *   correction-level="H"
 * />
 * ```
 */

const qrContainerEl = ref<HTMLDivElement | null>(null);

const props = withDefaults(defineProps<AppQrCodeProps>(), {
  typeNumber: 0,
  correctionLevel: 'H',
});

const onQrDataChanged = (newValue: AppQrCodeProps) => {
  if (!qrContainerEl.value) {
    throw new Error('qrContainerEl is null!');
  }

  const qr = qrcode(newValue.typeNumber || 0, newValue.correctionLevel || 'H');
  qr.addData(newValue.qrData);
  qr.make();

  qrContainerEl.value.innerHTML = qr.createSvgTag(4);
  const svgEl = qrContainerEl.value.children[0] as SVGElement;
  svgEl.setAttribute('width', '100%');
  svgEl.setAttribute('height', '100%');
};

watch(props, onQrDataChanged, { deep: true });

onMounted(() => {
  onQrDataChanged(props);
});
</script>
