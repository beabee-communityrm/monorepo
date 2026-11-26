/**
 * Where mounted components are on screen, so the panel can outline the
 * component behind a request.
 */
import {
  type App,
  type ComponentInternalInstance,
  type VNode,
  isVNode,
} from 'vue';

function findInstances(
  vnode: VNode,
  file: string,
  found: ComponentInternalInstance[] = []
) {
  if (vnode.component) {
    if (vnode.component.type.__file?.endsWith(file)) {
      found.push(vnode.component);
    }
    findInstances(vnode.component.subTree, file, found);
  } else if (vnode.suspense?.activeBranch) {
    findInstances(vnode.suspense.activeBranch, file, found);
  } else if (Array.isArray(vnode.children)) {
    for (const child of vnode.children) {
      if (isVNode(child)) findInstances(child, file, found);
    }
  }
  return found;
}

/** The box around an instance's elements, spanning all of them for a fragment */
function boxOf({ subTree }: ComponentInternalInstance) {
  const rects: DOMRect[] = [];
  for (let node = subTree.el; node; node = node.nextSibling) {
    if (node instanceof Element) rects.push(node.getBoundingClientRect());
    if (!subTree.anchor || node === subTree.anchor) break;
  }
  if (!rects.length) return;

  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return new DOMRect(left, top, right - left, bottom - top);
}

/** Boxes around each mounted component from the given source file */
export function componentBoxes(app: App, file: string) {
  const root = app._instance?.subTree;
  if (!root) return [];
  return findInstances(root, file)
    .map(boxOf)
    .filter((box) => box !== undefined);
}
