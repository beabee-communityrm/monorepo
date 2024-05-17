import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}

export interface MenuItem {
  title: string;
  href: string;
  icon: IconDefinition;
  isActive?: RegExp;
}
