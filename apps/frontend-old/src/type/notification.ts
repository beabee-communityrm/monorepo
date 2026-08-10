/**
 * Represents a notification that can be displayed to the user
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string;
  /** The message to display */
  message: string;
  /** The type/severity of the notification */
  type: 'success' | 'error' | 'info' | 'warning';
  /** Optional timeout in milliseconds after which the notification should be removed */
  timeout?: number;
}
