import { type Component, reactive } from 'vue';

interface Notification {
  id: number;
  title: string;
  description?: string;
  variant: 'success' | 'warning' | 'error' | 'info';
  body?: Component;
  /** Whether notification can be manually removed */
  removeable?: boolean | 'auto';
  /** Aria label for the remove button */
  removeAriaLabel?: string;
  timeout?: number;
}

export const notifications = reactive<Notification[]>([]);

let uniqueId = 0;
export function addNotification(notification: Omit<Notification, 'id'>) {
  const newNotification = {
    removeable: 'auto' as boolean | 'auto',
    removeAriaLabel: 'Close notification',
    ...notification,
    id: uniqueId++,
  };

  notifications.push(newNotification);

  if (notification.timeout !== 0) {
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, notification.timeout || 5000);
  }
}

export function removeNotification(id: number) {
  const index = notifications.findIndex((n) => n.id === id);
  if (index > -1) {
    notifications.splice(index, 1);
  }
}

export function useNotifications() {
  return {
    notifications,
    addNotification,
    removeNotification,
  };
}
