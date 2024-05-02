import type {
  ContentContactsData,
  ContentEmailData,
  ContentGeneralData,
  ContentId,
  ContentJoinData,
  ContentJoinSetupData,
  ContentPaymentData,
  ContentProfileData,
  ContentShareData,
  ContentTelegramData,
} from "./index.ts";

export type ContentData<Id extends ContentId = ContentId> = Id extends
  "contacts" ? ContentContactsData
  : never | Id extends "email" ? ContentEmailData
  : never | Id extends "general" ? ContentGeneralData
  : never | Id extends "join" ? ContentJoinData
  : never | Id extends "join/setup" ? ContentJoinSetupData
  : never | Id extends "profile" ? ContentProfileData
  : never | Id extends "share" ? ContentShareData
  : never | Id extends "payment" ? ContentPaymentData
  : never | Id extends "telegram" ? ContentTelegramData
  : never;
