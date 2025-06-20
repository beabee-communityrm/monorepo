import type { AppStepperStep } from './stepper';

/**
 * Props for the AppSlider component
 */
export interface AppSliderProps {
  /** Whether to allow infinite scrolling between slides */
  infinite?: boolean;
  /** Optional steps to display in the stepper navigation */
  steps?: AppStepperStep[];
}

/**
 * Event details emitted when a slide changes
 */
export interface AppSliderSlideEventDetails {
  /** The new slide number (0-based) */
  slideNumber: number;
  /** The previous slide number (0-based) */
  oldSlideNumber: number;
  /** The HTML element of the new slide */
  slideEl: HTMLElement;
}
