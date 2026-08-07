import {
  CalloutAccess,
  CalloutCaptcha,
  CalloutComponentType,
  type CalloutResponseAnswersSlide,
  type CreateCalloutData,
} from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { Callout } from '@beabee/core/models';
import CalloutsService from '@beabee/core/services/CalloutsService';

const log = mainLogger.child({ app: 'seed-map-preview-callout' });

const GUESTS = [
  { firstname: 'Alex', lastname: 'Guest' },
  { firstname: 'Jamie', lastname: 'Visitor' },
  { firstname: 'Sam', lastname: 'Neighbour' },
  { firstname: 'Chris', lastname: 'Resident' },
  { firstname: 'Priya', lastname: 'Local' },
  { firstname: 'Morgan', lastname: 'Passerby' },
  { firstname: 'Robin', lastname: 'Contributor' },
  { firstname: 'Taylor', lastname: 'Participant' },
];

const FEEDBACK_TEXTS = [
  'Three of the five units on the parade have been empty since the bank branch closed.',
  'The corner shop is the only one still trading here.',
  'This has been vacant for over a year now.',
  'Glad this is finally being looked into.',
  'There are two more units round the corner worth checking.',
  'Foot traffic has really dropped off since the market closed.',
  'Not sure this affects me directly, but good initiative.',
  'Really glad this is being looked into.',
];

// Scattered around the UK, matching the CrowdNewsroom design mockup's flavour
const POINTS: [number, number][] = [
  [-2.5879, 51.4545], // Bristol
  [-0.1278, 51.5074], // London
  [-2.2426, 53.4808], // Manchester
  [-1.8904, 52.4862], // Birmingham
  [-3.1791, 51.4816], // Cardiff
  [-1.6178, 54.9783], // Newcastle
  [-4.2518, 55.8642], // Glasgow
  [-1.4701, 53.3811], // Sheffield
];

function mockAddressAnswer(index: number) {
  const [lng, lat] = POINTS[index % POINTS.length];
  return {
    id: `mock-address-${index}`,
    formatted_address: `${100 + index} Example Street`,
    components: [],
    geometry: { location: { lat, lng } },
    source: 'maptiler' as const,
  };
}

/**
 * Creates a single open callout with the map response view enabled and
 * several guest responses with plotted address answers, for locally
 * verifying the CrowdNewsroom map preview against real data.
 */
export const seedMapPreviewCallout = async (): Promise<void> => {
  const { runApp } = await import('@beabee/core/server');

  await runApp(async () => {
    const now = new Date();
    const starts = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const calloutData: CreateCalloutData = {
      image: 'https://picsum.photos/seed/map-preview-callout/900/400',
      starts,
      expires,
      allowUpdate: true,
      allowMultiple: false,
      access: CalloutAccess.Guest,
      captcha: CalloutCaptcha.None,
      hidden: false,
      channels: null,
      sendResponseEmail: false,
      responseViewSchema: {
        buckets: [],
        titleProp: 'feedback',
        imageProp: '',
        imageFilter: '',
        links: [],
        gallery: false,
        map: {
          style: '',
          center: [-2.5, 53.5],
          bounds: [
            [-5, 50],
            [1, 57],
          ],
          minZoom: 0,
          maxZoom: 18,
          initialZoom: 5,
          addressProp: 'location',
          addressPattern: '{formatted_address}',
          addressPatternProp: 'formatted_address',
        },
      },
      formSchema: {
        slides: [
          {
            id: 'slide1',
            title: 'Your feedback',
            components: [
              {
                type: CalloutComponentType.INPUT_TEXT_AREA,
                id: 'feedback',
                key: 'feedback',
                label: 'What did you notice here?',
                input: true,
                validate: { required: true },
              },
              {
                type: CalloutComponentType.INPUT_ADDRESS,
                id: 'location',
                key: 'location',
                label: 'Location',
                input: true,
                validate: { required: false },
              },
            ],
            navigation: { nextSlideId: 'END' },
          },
        ],
      },
      variants: {
        default: {
          title: 'Test Atlas',
          excerpt: 'Explore how data maps across regions.',
          intro:
            'Explore how data maps across regions. Share your local knowledge to help build the picture.',
          thanksTitle: 'Thank you!',
          thanksText: 'Thanks for sharing what you know.',
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
    };

    const calloutId = await CalloutsService.createCallout(calloutData, false);

    const callout = await getRepository(Callout).findOneByOrFail({
      id: calloutId,
    });

    for (let i = 0; i < POINTS.length; i++) {
      const answers: CalloutResponseAnswersSlide = {
        slide1: {
          feedback: FEEDBACK_TEXTS[i % FEEDBACK_TEXTS.length],
          location: mockAddressAnswer(i),
        },
      };
      const guest = GUESTS[i % GUESTS.length];
      await CalloutsService.setGuestResponse(
        callout,
        { ...guest, email: `map-preview-guest-${i}@example.com` },
        answers,
        undefined
      );
    }

    log.info(
      `Created callout "${callout.slug}" with ${POINTS.length} mapped responses`
    );
  });
};
