export interface BaseCalloutComponentSchema {
  id: string;
  type: string;
  key: string;
  label?: string;
  input?: boolean;
  adminOnly?: boolean;
  [key: string]: unknown;
}

export interface NestableCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: "panel" | "well" | "tabs";
  input: false;
  components: CalloutComponentSchema[];
}

export interface InputCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type:
    | "address"
    | "button"
    | "checkbox"
    | "email"
    | "file"
    | "number"
    | "password"
    | "textfield"
    | "textarea";
  input: true;
}

export interface SelectCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: "select";
  input: true;
  data: { values: { label: string; value: string }[] };
}

export interface RadioCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: "radio" | "selectboxes";
  input: true;
  values: { label: string; value: string }[];
}

export type CalloutComponentSchema =
  | SelectCalloutComponentSchema
  | RadioCalloutComponentSchema
  | InputCalloutComponentSchema
  | NestableCalloutComponentSchema;

export interface CalloutNavigationSchema {
  prevText: string;
  nextText: string;
  nextSlideId: string;
  submitText: string;
}

export interface CalloutSlideSchema {
  id: string;
  components: CalloutComponentSchema[];
  navigation: CalloutNavigationSchema;
}

export interface CalloutFormSchema {
  slides: CalloutSlideSchema[];
}

export interface CalloutResponseAnswerAddress {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}
export interface CalloutResponseAnswerFileUpload {
  url: string;
}
export type CalloutResponseAnswer =
  | string
  | boolean
  | number
  | null
  | undefined
  | Record<string, boolean>
  | CalloutResponseAnswerAddress
  | CalloutResponseAnswerFileUpload;

export type CalloutResponseAnswers = Record<
  string,
  CalloutResponseAnswer | CalloutResponseAnswer[]
>;
