export enum ActivityEventType {
  CalloutCreated = 'callout.created',
  CalloutAnswered = 'callout.answered',
  ContactCreated = 'contact.created',
  ContactDeleted = 'contact.removed',
  PaymentInitiated = 'payment.initiated',
  PaymentFailed = 'payment.failed',
  PaymentSuccessful = 'payment.successful',
  PaymentCancelled = 'payment.cancelled',
}
