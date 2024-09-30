import type {
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
  CalloutResponseAnswersSlide,
} from "./index.ts";

export interface GetCalloutResponseMapData {
  number: number;
  answers: CalloutResponseAnswersSlide;
  title: string;
  photos: CalloutResponseAnswerFileUpload[];
  address?: CalloutResponseAnswerAddress;
}
