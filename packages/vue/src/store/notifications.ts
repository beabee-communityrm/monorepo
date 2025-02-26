import { ref, type Component } from 'vue';

export interface Notification {
  id?: string;
  title: string;
  description?: string;
  variant: 'success' | 'warning' | 'error' | 'info';
  body?: Component;
  /** Whether notification can be manually removed */
  removeable?: boolean | 'auto';
  timeout?: number;
}

const notifications = ref<Notification[]>([]);

export function addNotification(notification: Omit<Notification, 'id'>) {
  const id = Math.random().toString(36).substring(7);
  const newNotification = {
    removeable: 'auto' as boolean | 'auto',
    ...notification,
    id,
  };

  notifications.value.push(newNotification);

  if (notification.timeout !== 0) {
    setTimeout(() => {
      removeNotification(id);
    }, notification.timeout || 5000);
  }
}

export function removeNotification(id: string) {
  const index = notifications.value.findIndex((n) => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
}

export function useNotifications() {
  return {
    notifications,
    addNotification,
    removeNotification,
  };
}
