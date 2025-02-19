import { type Component, reactive } from 'vue';

interface Notification {
  id: number;
  title: string;
  description?: string;
  variant: 'success' | 'warning' | 'error' | 'info';
  body?: Component;
  /** Whether notification can be manually removed */
  removeable?: boolean | 'auto';
}

export const notifications = reactive<Notification[]>([]);

let uniqueId = 0;
export function addNotification(notification: Omit<Notification, 'id'>) {
  const id = uniqueId++;
  const newNotification = {
    removeable: true,
    ...notification,
    id,
  };

  notifications.push(newNotification);
}
