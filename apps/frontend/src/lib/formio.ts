// import BeabeeAddress from './formio/providers/address/beabee';
import { Form, FormBuilder } from '@formio/vue';
import { Formio } from 'formiojs';

import { MapTilerAddressProvider } from './formio/providers/address/MapTilerAddressProvider';
import BeabeeStorage from './formio/providers/storage/beabee';

Formio.Providers.providers.storage = { beabee: BeabeeStorage };
Formio.Providers.providers.address = { maptiler: MapTilerAddressProvider };

export { Form, FormBuilder };
