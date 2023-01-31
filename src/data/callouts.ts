interface BaseCalloutComponentSchema {
  key: string;
  label?: string;
  input?: boolean;
  // TODO: should only be on nestable components
  components?: CalloutComponentSchema[];
  [key: string]: unknown;
}

interface OtherCalloutComponentSchema extends BaseCalloutComponentSchema {
  type:
    | "button"
    | "checkbox"
    | "number"
    | "password"
    | "textfield"
    | "textarea";
}

interface SelectCalloutComponentSchema extends BaseCalloutComponentSchema {
  type: "select";
  data: { values: { label: string; value: string }[] };
}

interface RadioCalloutComponentSchema extends BaseCalloutComponentSchema {
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
