/**
 * Props for the AppRoundBadge component
 */
export interface AppRoundBadgeProps {
  /** Visual status type that determines the color */
  type: 'success' | 'warning' | 'danger';
  /** Size variant of the badge */
  size?: 'large' | 'small';
  /** Accessible label for screen readers */
  ariaLabel?: string;
}
