import type {
  CalloutComponentNestablePanelSchema,
  CalloutComponentNestableTabsSchema,
  CalloutComponentNestableWellSchema
} from "./index.js";

export type CalloutComponentNestableSchema =
  | CalloutComponentNestablePanelSchema
  | CalloutComponentNestableTabsSchema
  | CalloutComponentNestableWellSchema;
