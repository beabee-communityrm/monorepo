// import BeabeeAddress from './formio/providers/address/beabee';
import { Form, FormBuilder } from '@formio/vue';
import { Formio } from 'formiojs';

import { MapTilerAddressProvider } from './formio/providers/address/MapTilerAddressProvider';
import BeabeeStorage from './formio/providers/storage/beabee';

// Override all default providers
Formio.Providers.providers.storage = { beabee: BeabeeStorage };

// Add maptiler provider but keep the default providers for backwards compatibility
Formio.Providers.addProviders('address', { maptiler: MapTilerAddressProvider });

export { Form, FormBuilder };
