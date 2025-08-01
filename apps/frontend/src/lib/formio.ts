// import BeabeeAddress from './formio/providers/address/beabee';
import { Form, FormBuilder } from '@formio/vue';
import { Formio } from 'formiojs';

import BeabeeStorage from './formio/providers/storage/beabee';

// Formio2.Providers.providers.address = { beabee: BeabeeAddress };
Formio.Providers.providers.storage = { beabee: BeabeeStorage };

export { Form, FormBuilder };
