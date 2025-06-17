<script lang="ts" setup>
import { reactive } from 'vue';

import AppQRCode from './AppQRCode.vue';

const state = reactive({
  qrData: 'https://example.com',
  typeNumber: 0 as const,
  correctionLevel: 'M' as const,
});

const correctionLevels = ['L', 'M', 'Q', 'H'] as const;

const sampleValues = [
  'https://example.com',
  'Hello, World!',
  'mailto:contact@example.com',
  'tel:+1234567890',
  'wifi:T:WPA;S:MyNetwork;P:password123;;',
  'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Example Corp\nEMAIL:john@example.com\nEND:VCARD',
];
</script>

<template>
  <Story title="Utility/AppQRCode">
    <Variant title="Playground">
      <div class="flex flex-col items-center space-y-4">
        <div class="w-64">
          <AppQRCode
            :qr-data="state.qrData"
            :type-number="state.typeNumber"
            :correction-level="state.correctionLevel"
          />
        </div>

        <div class="rounded bg-grey-lighter p-3 text-center">
          <p class="text-sm font-medium">Scan this QR code</p>
          <p class="text-xs text-body-80">{{ state.qrData }}</p>
        </div>
      </div>

      <template #controls>
        <HstText v-model="state.qrData" title="QR Code Data" />
        <HstNumber
          v-model="state.typeNumber"
          title="Type Number (0=auto)"
          :min="0"
          :max="40"
          :step="1"
        />
        <HstSelect
          v-model="state.correctionLevel"
          title="Error Correction Level"
          :options="correctionLevels"
        />
      </template>
    </Variant>

    <Variant title="Different Sizes">
      <div class="flex flex-wrap items-end gap-6">
        <div class="text-center">
          <div class="w-24">
            <AppQRCode qr-data="Small QR Code" />
          </div>
          <p class="mt-2 text-sm">Small</p>
        </div>

        <div class="text-center">
          <div class="w-32">
            <AppQRCode qr-data="Medium QR Code" />
          </div>
          <p class="mt-2 text-sm">Medium</p>
        </div>

        <div class="text-center">
          <div class="w-48">
            <AppQRCode qr-data="Large QR Code" />
          </div>
          <p class="mt-2 text-sm">Large</p>
        </div>

        <div class="text-center">
          <div class="w-64">
            <AppQRCode qr-data="Extra Large QR Code" />
          </div>
          <p class="mt-2 text-sm">Extra Large</p>
        </div>
      </div>
    </Variant>

    <Variant title="Error Correction Levels">
      <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div v-for="level in correctionLevels" :key="level" class="text-center">
          <div class="w-32">
            <AppQRCode
              qr-data="Error correction test"
              :correction-level="level"
            />
          </div>
          <p class="mt-2 text-sm font-medium">Level {{ level }}</p>
          <p class="text-xs text-body-80">
            {{
              level === 'L'
                ? '~7%'
                : level === 'M'
                  ? '~15%'
                  : level === 'Q'
                    ? '~25%'
                    : '~30%'
            }}
            recovery
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Type Numbers">
      <div class="grid grid-cols-3 gap-6">
        <div class="text-center">
          <div class="w-32">
            <AppQRCode qr-data="Type Number Auto" :type-number="0" />
          </div>
          <p class="mt-2 text-sm">Auto (0)</p>
        </div>

        <div class="text-center">
          <div class="w-32">
            <AppQRCode qr-data="Type Number 1" :type-number="1" />
          </div>
          <p class="mt-2 text-sm">Type 1</p>
        </div>

        <div class="text-center">
          <div class="w-32">
            <AppQRCode qr-data="Type Number 5" :type-number="5" />
          </div>
          <p class="mt-2 text-sm">Type 5</p>
        </div>
      </div>
    </Variant>

    <Variant title="Different Content Types">
      <div class="space-y-6">
        <div
          v-for="(value, index) in sampleValues"
          :key="index"
          class="flex items-center gap-4"
        >
          <div class="w-24">
            <AppQRCode :qr-data="value" />
          </div>
          <div class="flex-1">
            <p class="font-medium">
              {{
                value.startsWith('https://')
                  ? 'Website URL'
                  : value.startsWith('mailto:')
                    ? 'Email Address'
                    : value.startsWith('tel:')
                      ? 'Phone Number'
                      : value.startsWith('wifi:')
                        ? 'WiFi Network'
                        : value.startsWith('BEGIN:VCARD')
                          ? 'Contact Card (vCard)'
                          : 'Plain Text'
              }}
            </p>
            <p class="text-sm text-body-80">{{ value.slice(0, 50) }}...</p>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Real-world Examples">
      <div class="space-y-8">
        <div>
          <h4 class="mb-4 font-medium">Business Card</h4>
          <div class="flex items-center gap-4">
            <div class="w-32">
              <AppQRCode
                qr-data="BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
ORG:Beabee Ltd.
TITLE:Community Manager
EMAIL:jane@beabee.io
TEL:+44123456789
URL:https://beabee.io
END:VCARD"
              />
            </div>
            <div>
              <p class="font-medium">Jane Smith</p>
              <p class="text-sm text-body-80">Community Manager</p>
              <p class="text-sm text-body-80">jane@beabee.io</p>
            </div>
          </div>
        </div>

        <div>
          <h4 class="mb-4 font-medium">WiFi Connection</h4>
          <div class="flex items-center gap-4">
            <div class="w-32">
              <AppQRCode qr-data="wifi:T:WPA;S:Beabee_Guest;P:welcome123;;" />
            </div>
            <div>
              <p class="font-medium">WiFi: Beabee_Guest</p>
              <p class="text-sm text-body-80">Password: welcome123</p>
              <p class="text-sm text-body-80">Security: WPA</p>
            </div>
          </div>
        </div>

        <div>
          <h4 class="mb-4 font-medium">Event Ticket</h4>
          <div class="flex items-center gap-4">
            <div class="w-32">
              <AppQRCode qr-data="https://events.beabee.io/ticket/ABC123" />
            </div>
            <div>
              <p class="font-medium">Event Ticket #ABC123</p>
              <p class="text-sm text-body-80">Beabee Annual Conference 2024</p>
              <p class="text-sm text-body-80">Scan for entry</p>
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Long Data">
      <div class="text-center">
        <div class="w-64">
          <AppQRCode
            qr-data="This is a longer piece of text that will be encoded in the QR code. QR codes can store different amounts of data depending on the error correction level and the type of data being encoded. This example shows how the component handles longer text content while maintaining readability and proper encoding."
            correction-level="L"
          />
        </div>
        <p class="mt-4 text-sm text-body-80">
          Long text content with lower error correction for maximum data
          capacity
        </p>
      </div>
    </Variant>
  </Story>
</template>
