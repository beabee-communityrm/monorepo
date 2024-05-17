import { type Component, reactive } from 'vue';

interface Notification {
  id: number;
  title: string;
  variant: 'success' | 'warning' | 'error';
  body?: Component;
}

export const notifications = reactive<Notification[]>([]);

let uniqueId = 0;
export function addNotification(notification: Omit<Notification, 'id'>) {
  notifications.push({ ...notification, id: uniqueId++ });
}
