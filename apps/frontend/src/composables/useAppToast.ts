import { useToast } from '@nuxt/ui/composables';

/**
 * Toasts in the app's standard style: errors for failed actions, successes
 * for completed ones
 */
export function useAppToast() {
  const toast = useToast();

  return {
    error: (title: string) =>
      toast.add({ color: 'error', icon: 'i-lucide-circle-alert', title }),
    success: (title: string) =>
      toast.add({ color: 'success', icon: 'i-lucide-circle-check', title }),
  };
}
