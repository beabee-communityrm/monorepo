import { Comment, Text, type Slot, type VNode } from 'vue';

// https://github.com/vuejs/core/issues/4733#issuecomment-1024816095
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

export function isInternalUrl(url: string | undefined): url is string {
  return !!url && /^\/([^/]|$)/.test(url);
}

export function setKey(
  obj: Record<string, unknown>,
  key: string,
  value: unknown
): void {
  const path = key.split('.');
  let i = 0;
  for (; i < path.length - 1; i++) {
    const p = path[i];
    if (obj[p] === undefined) {
      obj[p] = {};
    }
    obj = obj[p] as Record<string, unknown>;
  }
  obj[path[i]] = value;
}
