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
 * Labels for the form fields
 */
export interface NoticeFormLabels {
  /** Label for save button */
  save: string;
  /** Label for name field */
  name: string;
  /** Label for start date and time section */
  startDateAndTime: string;
  /** Label for expiration date and time section */
  expirationDateAndTime: string;
  /** Label for text field */
  text: string;
  /** Label for button text field */
  buttonText: string;
  /** Label for URL field */
  url: string;
}

/**
 * Props for the NoticeForm component
 */
export interface NoticeFormProps {
  /** Optional notice data for editing existing notices */
  notice?: GetNoticeData;
  /** Localized labels for form fields */
  labels: NoticeFormLabels;
}

/**
 * Events emitted by the NoticeForm component
 */
export interface NoticeFormEmits {
  /** Emitted when form is submitted with notice data */
  submit: [data: CreateNoticeData];
}
