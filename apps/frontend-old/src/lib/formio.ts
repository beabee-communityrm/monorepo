/*
 * We only support maptiler address provider and beabee storage provider for now
 * If you want to support other providers, you can add them here
 * and use `Formio.Providers.addProviders('address', { provider: Provider })`
 * to add them to the form builder.
 */
import { Form, FormBuilder } from '@formio/vue';
import { Formio } from 'formiojs';

import { MapTilerAddressProvider } from './formio/providers/address/map-tiler';
import BeabeeStorage from './formio/providers/storage/beabee';

// Override all default storage providers
Formio.Providers.providers.storage = { beabee: BeabeeStorage };

// Override all default address providers
Formio.Providers.providers.address = {
  maptiler: MapTilerAddressProvider,
};

export { Form, FormBuilder };
