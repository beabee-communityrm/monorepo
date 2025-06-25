/**
 * Type definitions for dialog components
 */

/**
 * Props for the AppModal component
 */
export interface AppModalProps {
  /** Whether the modal is currently open and visible */
  open: boolean;
  /** Title displayed in the modal header */
  title?: string;
  /** Visual variant affecting title styling */
  variant?: 'danger';
  /** Accessible text for the close button */
  closeButtonText?: string;
}

/**
 * Props for the AppConfirmDialog component
 */
export interface AppConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Visual variant for styling (affects button styling) */
  variant?: 'danger';
  /** Text for the confirm button */
  confirm: string;
  /** Text for the cancel button */
  cancel?: string;
  /** Title displayed in the dialog header */
  title: string;
  /** Whether to disable the confirm button */
  disableConfirm?: boolean;
  /** Async function to execute on confirm */
  onConfirm?: () => Promise<void> | void;
  /** Accessible text for the close button */
  closeButtonText?: string;
}
