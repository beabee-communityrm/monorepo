import { Comment, type Slot, Text, type VNode } from 'vue';

/**
 * Checks if a Vue slot has meaningful content
 * @param slot - The Vue slot to check
 * @param slotProps - Props to pass to the slot function
 * @returns True if the slot has meaningful content, false otherwise
 *
 * @example
 * ```vue
 * <div v-if="hasSlotContent($slots.footer)">
 *   <slot name="footer" />
 * </div>
 * ```
 */
export function hasSlotContent(
  slot: Slot | undefined,
  slotProps = {}
): boolean {
  if (!slot) return false;

  return slot(slotProps).some((vnode: VNode) => {
    if (vnode.type === Comment) return false;

    if (Array.isArray(vnode.children) && !vnode.children.length) return false;

    return (
      vnode.type !== Text ||
      (typeof vnode.children === 'string' && vnode.children.trim() !== '')
    );
  });
}
