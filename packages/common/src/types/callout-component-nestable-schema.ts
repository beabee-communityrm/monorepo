import type {
  CalloutComponentNestablePanelSchema,
  CalloutComponentNestableTabsSchema,
  CalloutComponentNestableWellSchema,
} from "./index.ts";

export type CalloutComponentNestableSchema =
  | CalloutComponentNestablePanelSchema
  | CalloutComponentNestableTabsSchema
  | CalloutComponentNestableWellSchema;
