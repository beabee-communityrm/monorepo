/*
 * We only support maptiler address provider and beabee storage provider for now
 * If you want to support other providers, you can add them here
 * and use `Formio.Providers.addProviders('address', { provider: Provider })`
 * to add them to the form builder.
 */
import { Form, FormBuilder } from '@formio/vue';
import { Formio, Templates } from 'formiojs';

import AudioRecorderComponent from './formio/components/audio-recorder/AudioRecorder';
import { MapTilerAddressProvider } from './formio/providers/address/map-tiler';
import BeabeeStorage from './formio/providers/storage/beabee';
import componentForm from './formio/templates/component';
import inputForm from './formio/templates/input';

// Override all default storage providers
Formio.Providers.providers.storage = { beabee: BeabeeStorage };

// Override all default address providers
Formio.Providers.providers.address = {
  maptiler: MapTilerAddressProvider,
};

// Register the audio recorder component (record or upload audio, extends
// the stock file component to reuse its upload/validation machinery).
// formiojs types only declare `Formio.Providers`, not `Formio.Components`,
// though it exists at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Formio as any).Components.addComponent(
  'audiorecorder',
  AudioRecorderComponent
);

// Override individual templates. The setter merges what it is given over the
// defaults, so only the templates named here are replaced.
Templates.current = {
  component: { form: componentForm },
  input: { form: inputForm },
};

export { Form, FormBuilder };
