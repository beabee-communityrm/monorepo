import { type CalloutComponentSchema } from '@beabee/beabee-common';

import type { LocaleProp } from '#type';

/**
 * Reference interface for the Form Builder component
 * Provides access to the underlying form builder instance
 */
export interface FormBuilderRef {
  /** The form builder instance containing the form components */
  builder: { form: { components: CalloutComponentSchema[] } };
}

/**
 * Navigation configuration for a form builder slide
 * Controls the navigation buttons and their behavior between slides
 */
export interface FormBuilderNavigation {
  /** Text for the "Previous" button, supports multiple locales */
  prevText: LocaleProp;
  /** Text for the "Next" button, supports multiple locales */
  nextText: LocaleProp;
  /** ID of the next slide to navigate to. Empty string means default next slide */
  nextSlideId: string;
  /** Text for the "Submit" button on the final slide, supports multiple locales */
  submitText: LocaleProp;
}

/**
 * Represents a single slide in the form builder
 * Contains the slide's content and navigation configuration
 */
export interface FormBuilderSlide {
  /** Unique identifier for the slide */
  id: string;
  /** Internal title of the slide (used for management, not displayed to users) */
  title: string;
  /** Array of form components that make up the slide's content */
  components: CalloutComponentSchema[];
  /** Navigation configuration for this slide */
  navigation: FormBuilderNavigation;
}

/**
 * Configuration options for the form builder
 * Defines available component types and their settings
 */
export const formOpts = {
  noDefaultSubmitButton: true,
  builder: {
    basic: false,
    advanced: false,
    data: false,
    resource: false,
    premium: false,
    layout: false,
    custom: {
      title: 'Basic',
      default: true,
      components: {
        textfield: {
          title: 'Text Field',
          icon: 'terminal',
          schema: {
            type: 'textfield',
          },
        },
        textarea: {
          title: 'Text Area',
          icon: 'font',
          schema: {
            type: 'textarea',
          },
        },
        number: {
          title: 'Number',
          icon: 'hashtag',
          schema: {
            type: 'number',
          },
        },
        email: {
          title: 'Email',
          icon: 'at',
          schema: {
            type: 'email',
          },
        },
        url: {
          title: 'Url',
          icon: 'link',
          schema: {
            type: 'url',
          },
        },
        checkbox: {
          title: 'Checkbox',
          icon: 'check-square',
          schema: {
            type: 'checkbox',
          },
        },
        select: {
          title: 'Dropdown',
          icon: 'th-list',
          schema: {
            type: 'select',
          },
        },
        selectboxes: {
          title: 'Select Boxes',
          group: 'basic',
          icon: 'plus-square',
          schema: {
            type: 'selectboxes',
          },
        },
        radio: {
          title: 'Radio',
          icon: 'dot-circle-o',
          schema: {
            type: 'radio',
          },
        },
      },
    },
    custom2: {
      title: 'Advanced',
      components: {
        address: {
          title: 'Address',
          icon: 'home',
          schema: {
            type: 'address',
          },
        },
        phoneNumber: {
          title: 'Phone Number',
          icon: 'phone-square',
          schema: {
            type: 'phoneNumber',
          },
        },
        currency: {
          title: 'Currency',
          icon: 'usd',
          schema: {
            type: 'currency',
          },
        },
        datetime: {
          title: 'Date / Time',
          icon: 'calendar',
          schema: {
            type: 'datetime',
          },
        },
        time: {
          title: 'Time',
          icon: 'clock-o',
          schema: {
            type: 'time',
          },
        },
        signature: {
          title: 'Signature',
          icon: 'pencil',
          schema: {
            type: 'signature',
          },
        },
        file: {
          title: 'File',
          icon: 'cloud-upload',
          schema: {
            type: 'file',
          },
        },
        content: {
          title: 'Content',
          icon: 'html5',
          schema: {
            type: 'content',
          },
        },
      },
    },
  },
};
