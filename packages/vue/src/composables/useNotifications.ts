/**
 * Composable for consistent notification handling across Vue components
 * Provides utilities for showing success, error, info, and warning notifications
 */
import { addNotification } from '../store/notifications';

/**
 * Notification options
 */
export interface NotificationOptions {
  /** Custom title for the notification */
  title?: string;
  /** Description text for the notification */
  description?: string;
  /** How long to show the notification (in ms) or 'auto' */
  duration?: number | 'auto';
  /** Whether the notification can be manually removed */
  removeable?: boolean | 'auto';
  /** ARIA label for the remove button */
  removeAriaLabel?: string;
  /** Custom action button */
  action?: {
    label: string;
    handler: () => void;
    ariaLabel?: string;
  };
}

/**
 * Copy operation result
 */
export interface CopyOptions {
  /** Text to copy to clipboard */
  text: string;
  /** Success message to show */
  successMessage?: string;
  /** Error message to show */
  errorMessage?: string;
  /** Error description template with {error} placeholder */
  errorDescription?: string;
  /** ARIA label for notification remove button */
  removeAriaLabel?: string;
}

/**
 * Provides notification utilities for components
 * @returns Notification management functions
 *
 * @example
 * const { showSuccess, showError, showInfo, copyToClipboard } = useNotificationHelpers();
 *
 * showSuccess('Operation completed successfully');
 * showError('Something went wrong', new Error('Network error'));
 * copyToClipboard({ text: 'Hello World', successMessage: 'Copied!' });
 */
export function useNotificationHelpers() {
  /**
   * Shows a success notification
   * @param message - Success message to display
   * @param options - Additional notification options
   */
  const showSuccess = (message: string, options: NotificationOptions = {}) => {
    addNotification({
      title: message,
      variant: 'success',
      removeable: 'auto',
      removeAriaLabel: 'Close notification',
      ...options,
    });
  };

  /**
   * Shows an error notification
   * @param message - Error message to display
   * @param error - Optional error object for additional context
   * @param options - Additional notification options
   */
  const showError = (
    message: string,
    error?: Error | string,
    options: NotificationOptions = {}
  ) => {
    const description = error
      ? typeof error === 'string'
        ? error
        : error.message
      : options.description;

    addNotification({
      title: message,
      description,
      variant: 'error',
      removeable: 'auto',
      removeAriaLabel: 'Close notification',
      ...options,
    });
  };

  /**
   * Shows an info notification
   * @param message - Info message to display
   * @param options - Additional notification options
   */
  const showInfo = (message: string, options: NotificationOptions = {}) => {
    addNotification({
      title: message,
      variant: 'info',
      removeable: 'auto',
      removeAriaLabel: 'Close notification',
      ...options,
    });
  };

  /**
   * Shows a warning notification
   * @param message - Warning message to display
   * @param options - Additional notification options
   */
  const showWarning = (message: string, options: NotificationOptions = {}) => {
    addNotification({
      title: message,
      variant: 'warning',
      removeable: 'auto',
      removeAriaLabel: 'Close notification',
      ...options,
    });
  };

  /**
   * Copies text to clipboard and shows appropriate notification
   * @param options - Copy operation configuration
   * @returns Promise that resolves when copy operation completes
   */
  const copyToClipboard = async (options: CopyOptions): Promise<boolean> => {
    const {
      text,
      successMessage = 'Copied to clipboard',
      errorMessage = 'Failed to copy',
      errorDescription,
      removeAriaLabel = 'Close notification',
    } = options;

    try {
      await navigator.clipboard.writeText(text);
      showSuccess(successMessage, { removeAriaLabel });
      return true;
    } catch (error) {
      const description = errorDescription
        ? errorDescription.replace('{error}', String(error))
        : undefined;

      showError(errorMessage, error as Error, {
        description,
        removeAriaLabel,
      });
      return false;
    }
  };

  /**
   * Shows a loading notification that can be updated later
   * @param message - Loading message to display
   * @param options - Additional notification options
   * @returns Function to update or dismiss the loading notification
   */
  const showLoading = (message: string, options: NotificationOptions = {}) => {
    // Note: This would need to be implemented based on the notification store's capabilities
    // For now, showing a basic info notification
    addNotification({
      title: message,
      variant: 'info',
      removeable: false,
      removeAriaLabel: 'Loading...',
      ...options,
    });

    // Return update function (implementation would depend on store capabilities)
    return {
      update: (newMessage: string) => {
        // Implementation would update the existing notification
        showInfo(newMessage, options);
      },
      dismiss: () => {
        // Implementation would dismiss the loading notification
      },
    };
  };

  /**
   * Shows a confirmation-style notification with action buttons
   * @param message - Confirmation message
   * @param confirmAction - Action to take on confirmation
   * @param options - Additional notification options
   */
  const showConfirmation = (
    message: string,
    confirmAction: () => void,
    options: NotificationOptions = {}
  ) => {
    addNotification({
      title: message,
      variant: 'info',
      removeable: true,
      removeAriaLabel: 'Close notification',
      action: {
        label: 'Confirm',
        handler: confirmAction,
        ariaLabel: 'Confirm action',
      },
      ...options,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    showConfirmation,
    copyToClipboard,
  };
}
