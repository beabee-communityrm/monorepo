import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface BreadcrumbItem {
  title: string;
  to?: string;
  icon?: IconDefinition;
}
