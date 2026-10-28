import {
  ALLOWED_AUDIO_EXTENSIONS,
  ALLOWED_AUDIO_MIME_TYPES,
} from '@beabee/beabee-common';

import {
  DEFAULT_MAX_DURATION_S,
  MAX_DURATION_LIMIT_S,
  formatTime,
  parseDuration,
} from './duration';

const ALLOWED_FILE_PATTERN_TYPES = [
  'audio/*',
  ...ALLOWED_AUDIO_EXTENSIONS.map((extension) => '.' + extension),
  ...ALLOWED_AUDIO_MIME_TYPES,
];

// Settings with no effect on this component's own UI, or fixed for it
const hidden = (...keys: string[]) =>
  keys.map((key) => ({ key, ignore: true }));

/**
 * Builder settings layered over the stock file component's, keyed by tab.
 * English-only like the rest of the builder.
 */
export default [
  // Multiple Values was its only setting not hidden by form-builder.css
  { key: 'data', ignore: true },
  {
    key: 'file',
    components: [
      ...hidden(
        'dir',
        'fileNameTemplate',
        'fileTypes',
        'image',
        'imageSize',
        'uploadOnly',
        'webcam',
        'webcamSize',
        'fileMinSize',
        'fileMaxSize'
      ),
      {
        type: 'textfield',
        input: true,
        key: 'maxDuration',
        label: 'Maximum duration',
        placeholder: formatTime(DEFAULT_MAX_DURATION_S),
        description:
          'Minutes and seconds (m:ss), up to ' +
          formatTime(MAX_DURATION_LIMIT_S),
        weight: 45,
        validate: {
          required: true,
          custom: ({ input }: { input: string }) => {
            const seconds = parseDuration(input);
            return (
              (seconds !== undefined &&
                seconds > 0 &&
                seconds <= MAX_DURATION_LIMIT_S) ||
              'Maximum duration must be between ' +
                formatTime(1) +
                ' and ' +
                formatTime(MAX_DURATION_LIMIT_S) +
                ', written as m:ss'
            );
          },
        },
      },
      {
        key: 'filePattern',
        overrideEditForm: true,
        placeholder: '.mp3,.wav',
        tooltip: '',
        description: 'Allowed types: ' + ALLOWED_FILE_PATTERN_TYPES.join(', '),
        validate: {
          required: true,
          custom: ({ input }: { input: string }) =>
            input
              .replace(/\s/g, '')
              .split(',')
              .every((type) =>
                ALLOWED_FILE_PATTERN_TYPES.includes(type.toLowerCase())
              ) ||
            'File Pattern can only include audio types: ' +
              ALLOWED_FILE_PATTERN_TYPES.join(', '),
        },
      },
    ],
  },
];
