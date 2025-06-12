import type { GetCalloutFormSchema } from '@beabee/beabee-common';

import { calloutNavigation1 } from './callout-navigation-1.js';
import { calloutAddress1Form } from './components/callout-address-1-form.js';
import { calloutCheckbox1Form } from './components/callout-checkbox-1-form.js';
import { calloutContent1Form } from './components/callout-content-1-form.js';
import { calloutDateTime1Form } from './components/callout-datetime-1-form.js';
import { calloutEmail1Form } from './components/callout-email-1-form.js';
import { calloutFile1Form } from './components/callout-file-1-form.js';
import { calloutFile2Form } from './components/callout-file-2-form.js';
import { calloutFile3Form } from './components/callout-file-3-form.js';
import { calloutNumber1Form } from './components/callout-number-1-form.js';
import { calloutNumber2Form } from './components/callout-number-2-form.js';
import { calloutNumber3Form } from './components/callout-number-3-form.js';
import { calloutNumber4Form } from './components/callout-number-4-form.js';
import { calloutPhoneNumber1Form } from './components/callout-phone-number-1-form.js';
import { calloutRadio1Form } from './components/callout-radio-1-form.js';
import { calloutSelect1Form } from './components/callout-select-1-form.js';
import { calloutSelectboxes1Form } from './components/callout-selectboxes-1-form.js';
import { calloutSignature1Form } from './components/callout-signature-1-form.js';
import { calloutTextarea1Form } from './components/callout-textarea-1-form.js';
import { calloutTime1Form } from './components/callout-time-1-form.js';
import { calloutUrl1Form } from './components/callout-url-1-form.js';

export const calloutForm1Schema: GetCalloutFormSchema = {
  slides: [
    {
      id: 'slidej5rkpu',
      title: 'Coding and life',
      components: [calloutTextarea1Form],
      navigation: calloutNavigation1,
    },
    {
      id: 'slidecpvs6e',
      title: 'Coding',
      components: [calloutRadio1Form, calloutSelectboxes1Form],
      navigation: calloutNavigation1,
    },
    {
      id: 'slide4fmgkk',
      title: 'Numbers',
      components: [
        calloutNumber1Form,
        calloutNumber2Form,
        calloutNumber3Form,
        calloutNumber4Form,
      ],
      navigation: calloutNavigation1,
    },
    {
      id: 'slided4f440',
      title: 'Contact',
      components: [
        calloutEmail1Form,
        calloutTime1Form,
        calloutAddress1Form,
        calloutUrl1Form,
        calloutPhoneNumber1Form,
        calloutDateTime1Form,
        calloutCheckbox1Form,
        calloutSignature1Form,
      ],
      navigation: calloutNavigation1,
    },
    {
      id: 'slidewxji2g',
      title: 'Others',
      components: [
        calloutSelect1Form,
        calloutContent1Form,
        calloutFile1Form,
        calloutFile2Form,
        calloutFile3Form,
      ],
      navigation: calloutNavigation1,
    },
  ],
  componentText: {},
};
