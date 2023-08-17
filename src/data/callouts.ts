export interface BaseCalloutComponentSchema {
  key: string;
  label?: string;
  input?: boolean;
  // TODO: should only be on nestable components
  components?: CalloutComponentSchema[];
  [key: string]: unknown;
}

export interface OtherCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type:
    | "address"
    | "button"
    | "checkbox"
    | "email"
    | "number"
    | "password"
    | "textfield"
    | "textarea";
}

export interface SelectCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: "select";
  data: { values: { label: string; value: string }[] };
}

export interface RadioCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: "radio" | "selectboxes";
  values: { label: string; value: string }[];
}

export type CalloutComponentSchema =
  | SelectCalloutComponentSchema
  | RadioCalloutComponentSchema
  | OtherCalloutComponentSchema;

export interface CalloutFormSchema {
  components: CalloutComponentSchema[];
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
