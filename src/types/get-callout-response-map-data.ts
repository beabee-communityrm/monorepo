import type {
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
  CalloutResponseAnswers,
} from "./index.ts";

export interface GetCalloutResponseMapData {
  number: number;
  answers: CalloutResponseAnswers;
  title: string;
  photos: CalloutResponseAnswerFileUpload[];
  address?: CalloutResponseAnswerAddress;
}
