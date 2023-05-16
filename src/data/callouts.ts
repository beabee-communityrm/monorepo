export interface BaseCalloutComponentSchema {
  type: string;
  key: string;
  label: string;
  input: boolean;
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

export interface CalloutFormSchema {
  display?: "form" | "wizard";
  components: CalloutComponentSchema[];
}

export type CalloutResponseAnswer =
  | string
  | boolean
  | number
  | null
  | undefined
  | Record<string, boolean>;

export type CalloutResponseAnswers = Record<string, CalloutResponseAnswer>;
