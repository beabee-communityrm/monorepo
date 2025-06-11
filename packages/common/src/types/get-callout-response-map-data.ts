import type {
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
  CalloutResponseAnswersSlide,
} from './index.js';

export interface GetCalloutResponseMapData {
  number: number;
  answers: CalloutResponseAnswersSlide;
  title: string;
  photos: CalloutResponseAnswerFileUpload[];
  address?: CalloutResponseAnswerAddress;
}
