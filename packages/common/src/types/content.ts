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
} from "./index.ts";

export type Content<Id extends ContentId> = Id extends "join" ? ContentJoinData
  : Id extends "join/setup" ? ContentJoinSetupData
  : Id extends "profile" ? ContentProfileData
  : Id extends "general" ? ContentGeneralData
  : Id extends "contacts" ? ContentContactsData
  : Id extends "email" ? ContentEmailData
  : Id extends "share" ? ContentShareData
  : Id extends "payment" ? ContentPaymentData
  : never;
