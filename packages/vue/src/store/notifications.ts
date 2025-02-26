import { ref } from "vue";

export interface Notification {
  id?: string;
  title: string;
  variant?: "success" | "error";
  timeout?: number;
}

const notifications = ref<Notification[]>([]);

export function addNotification(notification: Notification) {
  const id = Math.random().toString(36).substring(7);
  notifications.value.push({ ...notification, id });

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
