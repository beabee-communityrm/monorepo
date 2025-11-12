import {
  CalloutAccess,
  CalloutCaptcha,
  CalloutComponentType,
  type CalloutResponseAnswersSlide,
  type CreateCalloutData,
} from '@beabee/beabee-common';

export const createTestCallout = (
  slug = 'test-callout-' + Date.now()
): CreateCalloutData => ({
  slug,
  image: 'https://placehold.co/150',
  starts: new Date(),
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  channels: [],
  access: CalloutAccess.Anonymous,
  captcha: CalloutCaptcha.None,
  allowUpdate: true,
  allowMultiple: false,
  hidden: false,
  sendResponseEmail: false,
  variants: {
    default: {
      title: 'Default',
      excerpt: 'Default variant',
      intro: 'Default variant',
      thanksTitle: 'Default variant',
      thanksText: 'Default variant',
      thanksRedirect: null,
      shareTitle: null,
      shareDescription: null,
      slideNavigation: {},
      componentText: {},
      responseLinkText: {},
      responseEmailSubject: null,
      responseEmailBody: null,
    },
  },
  formSchema: {
    slides: [
      {
        id: 'slide1',
        title: 'Personal Information',
        components: [
          {
            type: CalloutComponentType.INPUT_TEXT_FIELD,
            id: 'name',
            key: 'name',
            label: 'Full Name',
            placeholder: 'Enter your full name',
            input: true,
            validate: {
              required: true,
            },
          },
          {
            type: CalloutComponentType.INPUT_EMAIL,
            id: 'email',
            key: 'email',
            label: 'Email Address',
            placeholder: 'Enter your email',
            input: true,
            validate: {
              required: true,
            },
          },
          {
            type: CalloutComponentType.INPUT_ADDRESS,
            id: 'address',
            key: 'address',
            label: 'Address',
            input: true,
            validate: {
              required: false,
            },
          },
        ],
        navigation: {
          nextSlideId: 'slide2',
        },
      },
      {
        id: 'slide2',
        title: 'Additional Information',
        components: [
          {
            type: CalloutComponentType.INPUT_TEXT_AREA,
            id: 'comments',
            key: 'comments',
            label: 'Comments',
            placeholder: 'Enter any additional comments',
            input: true,
            validate: {
              required: false,
            },
          },
          {
            type: CalloutComponentType.INPUT_SELECT,
            id: 'category',
            key: 'category',
            label: 'Category',
            input: true,
            data: {
              values: [
                { label: 'Option 1', value: 'opt1' },
                { label: 'Option 2', value: 'opt2' },
              ],
            },
            validate: {
              required: true,
            },
          },
        ],
        navigation: {
          nextSlideId: 'slide3',
        },
      },
    ],
  },
});

export const createMinimalTestCallout = (
  slug = 'minimal-test-callout-' + Date.now()
): CreateCalloutData => ({
  slug,
  image: 'https://placehold.co/150',
  starts: new Date(),
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  channels: [],
  access: CalloutAccess.Anonymous,
  captcha: CalloutCaptcha.None,
  allowUpdate: false,
  allowMultiple: false,
  hidden: false,
  sendResponseEmail: false,
  variants: {
    default: {
      title: 'Minimal Variant',
      excerpt: 'Minimal variant for testing',
      intro: 'This is a minimal variant for testing purposes.',
      thanksTitle: 'Thank You!',
      thanksText: 'Your response has been recorded.',
      thanksRedirect: null,
      shareTitle: null,
      shareDescription: null,
      slideNavigation: {},
      componentText: {},
      responseLinkText: {},
      responseEmailSubject: null,
      responseEmailBody: null,
    },
  },
  formSchema: {
    slides: [
      {
        id: 'slide1',
        title: 'Basic Information',
        components: [
          {
            type: CalloutComponentType.INPUT_TEXT_FIELD,
            id: 'name',
            key: 'name',
            label: 'Name',
            input: true,
            validate: {
              required: true,
            },
          },
        ],
        navigation: {
          nextSlideId: 'slide2',
        },
      },
    ],
  },
});

export const createTestCalloutResponseAnswers = (
  slideId = 'slide1'
): CalloutResponseAnswersSlide => ({
  [slideId]: {
    name: 'Test Name',
    email: 'test@example.com',
    comments: 'Test comment',
    category: 'opt1',
    address: '123 Test Street, Test City, 12345',
  },
});

export const createMinimalTestCalloutResponseAnswers = (
  slideId = 'slide1'
): CalloutResponseAnswersSlide => ({
  [slideId]: {
    name: 'Test Name',
  },
});
