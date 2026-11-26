import { createRouter, createWebHistory } from 'vue-router';
import { handleHotUpdate, routes } from 'vue-router/auto-routes';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from) {
    if (from && to.name === from.name) return;
    // Vue Router only resets the window. The Dashboard layout scrolls its
    // <main id="top"> instead, so that's reset here too.
    document.getElementById('top')?.scrollTo({ top: 0 });
    return { top: 0 };
  },
});

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
  handleHotUpdate(router);
}

export default router;
