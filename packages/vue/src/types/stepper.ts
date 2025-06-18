/**
 * Interface representing a single step in the stepper component
 */
export interface AppStepperStep {
  /** The display name of the step */
  name: string;
  /** Whether this step has been completed/validated */
  validated: boolean;
  /** Whether this step has an error */
  error: boolean;
}
