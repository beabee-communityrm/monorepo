<script lang="ts" setup>
import {
  faBook,
  faCog,
  faFolder,
  faHome,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { reactive } from 'vue';

import type { BreadcrumbItem } from './TheBreadcrumb.vue';
import TheBreadcrumb from './TheBreadcrumb.vue';

const state = reactive({
  showIcons: true,
});

const simpleCrumbs: BreadcrumbItem[] = [
  { title: 'Home', to: '/' },
  { title: 'Users', to: '/users' },
  { title: 'John Doe' },
];

const iconCrumbs: BreadcrumbItem[] = [
  { title: 'Home', to: '/', icon: faHome },
  { title: 'Projects', to: '/projects', icon: faFolder },
  { title: 'My Project', to: '/projects/123', icon: faBook },
  { title: 'Settings', icon: faCog },
];

const longCrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', to: '/', icon: faHome },
  { title: 'Administration', to: '/admin', icon: faCog },
  { title: 'User Management', to: '/admin/users', icon: faUser },
  { title: 'User Profiles', to: '/admin/users/profiles' },
  { title: 'Profile Settings', to: '/admin/users/profiles/settings' },
  { title: 'Security Settings' },
];

const deepNestingCrumbs: BreadcrumbItem[] = [
  { title: 'Root', to: '/' },
  { title: 'Level 1', to: '/level1' },
  { title: 'Level 2', to: '/level1/level2' },
  { title: 'Level 3', to: '/level1/level2/level3' },
  { title: 'Level 4', to: '/level1/level2/level3/level4' },
  { title: 'Level 5', to: '/level1/level2/level3/level4/level5' },
  { title: 'Current Page' },
];
</script>

<template>
  <Story title="Navigation/TheBreadcrumb">
    <Variant title="Playground">
      <div class="space-y-4">
        <div class="rounded border p-4">
          <h3 class="mb-2 text-lg font-semibold">Current Location</h3>
          <TheBreadcrumb :items="state.showIcons ? iconCrumbs : simpleCrumbs" />

          <div class="mt-4 rounded bg-grey-lighter p-3">
            <p class="text-sm">
              <strong>Current page:</strong>
              {{
                (state.showIcons ? iconCrumbs : simpleCrumbs).slice(-1)[0]
                  ?.title
              }}
            </p>
            <p class="mt-1 text-xs text-body-80">
              Breadcrumbs help users understand their current location and
              navigate back to parent pages.
            </p>
          </div>
        </div>
      </div>

      <template #controls>
        <HstCheckbox v-model="state.showIcons" title="Show Icons" />
      </template>
    </Variant>

    <Variant title="Simple Breadcrumb">
      <div class="space-y-4">
        <div>
          <h4 class="mb-2 font-medium">Basic Navigation</h4>
          <TheBreadcrumb :items="simpleCrumbs" />
        </div>

        <div class="bg-info-10 rounded p-3">
          <p class="text-info-80 text-sm">
            Simple breadcrumb without icons, showing a basic navigation path.
            The last item is not clickable as it represents the current page.
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="With Icons">
      <div class="space-y-4">
        <div>
          <h4 class="mb-2 font-medium">Enhanced Navigation</h4>
          <TheBreadcrumb :items="iconCrumbs" />
        </div>

        <div class="bg-info-10 rounded p-3">
          <p class="text-info-80 text-sm">
            Breadcrumb with icons for better visual recognition. Icons help
            users quickly identify different sections.
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Long Navigation Path">
      <div class="space-y-4">
        <div>
          <h4 class="mb-2 font-medium">Deep Navigation Structure</h4>
          <TheBreadcrumb :items="longCrumbs" />
        </div>

        <div class="rounded bg-warning-10 p-3">
          <p class="text-warning-80 text-sm">
            <strong>Note:</strong> Long breadcrumb paths should be used
            carefully. Consider breaking down deep navigation structures for
            better UX.
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Very Deep Nesting">
      <div class="space-y-4">
        <div>
          <h4 class="mb-2 font-medium">Maximum Depth Example</h4>
          <TheBreadcrumb :items="deepNestingCrumbs" />
        </div>

        <div class="rounded bg-warning-10 p-3">
          <p class="text-warning-80 text-sm">
            <strong>Warning:</strong> This example shows very deep nesting. In
            real applications, consider using abbreviated paths or different
            navigation patterns.
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Single Item">
      <div class="space-y-4">
        <div>
          <h4 class="mb-2 font-medium">Root Level</h4>
          <TheBreadcrumb :items="[{ title: 'Home', icon: faHome }]" />
        </div>

        <div class="bg-info-10 rounded p-3">
          <p class="text-info-80 text-sm">
            When there's only one breadcrumb item, it represents the root or
            home page. No separators are shown in this case.
          </p>
        </div>
      </div>
    </Variant>

    <Variant title="Real-world Examples">
      <div class="space-y-6">
        <div>
          <h4 class="mb-2 font-medium">E-commerce Product Page</h4>
          <TheBreadcrumb
            :items="[
              { title: 'Home', to: '/', icon: faHome },
              { title: 'Electronics', to: '/electronics' },
              { title: 'Laptops', to: '/electronics/laptops' },
              { title: 'Gaming Laptops', to: '/electronics/laptops/gaming' },
              { title: 'ASUS ROG Strix G15' },
            ]"
          />
        </div>

        <div>
          <h4 class="mb-2 font-medium">Blog Article</h4>
          <TheBreadcrumb
            :items="[
              { title: 'Home', to: '/', icon: faHome },
              { title: 'Blog', to: '/blog', icon: faBook },
              { title: 'Technology', to: '/blog/technology' },
              { title: 'Web Development', to: '/blog/technology/web-dev' },
              { title: 'Vue.js Best Practices' },
            ]"
          />
        </div>

        <div>
          <h4 class="mb-2 font-medium">User Account Settings</h4>
          <TheBreadcrumb
            :items="[
              { title: 'Dashboard', to: '/', icon: faHome },
              { title: 'Account', to: '/account', icon: faUser },
              { title: 'Settings', to: '/account/settings', icon: faCog },
              { title: 'Privacy & Security' },
            ]"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
