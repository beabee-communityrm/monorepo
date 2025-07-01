import type { CreateNoticeData, GetNoticeData } from '@beabee/beabee-common';

/**
 * Form data structure for notice creation and editing
 */
export interface NoticeFormData {
  /** The display name of the notice */
  name: string;
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** Start time in HH:mm format */
  startTime: string;
  /** Expiration date in YYYY-MM-DD format */
  expirationDate: string;
  /** Expiration time in HH:mm format */
  expirationTime: string;
  /** The main text content of the notice */
  text: string;
  /** Optional button text for call-to-action */
  buttonText?: string;
  /** Optional URL for the button action */
  url?: string;
}

/**
 * Props for the NoticeForm component
 */
export interface NoticeFormProps {
  /** Optional notice data for editing existing notices */
  notice?: GetNoticeData;
}

/**
 * Events emitted by the NoticeForm component
 */
export interface NoticeFormEmits {
  /** Emitted when form is submitted with notice data */
  submit: [data: CreateNoticeData];
}
