import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

/**
 * Props for the AppTemplate component
 */
export interface AppTemplateProps {
  /** The main title displayed in the component */
  title?: string;
  /** Optional description text for additional context */
  description?: string;
  /** Visual variant of the component */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Size variant of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Optional icon to display in the header */
  icon?: IconDefinition;
  /** Optional badge text to display in the header */
  badge?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}
