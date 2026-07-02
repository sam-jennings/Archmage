export interface ControlsVariant {
  connector?: string;
  art?: string;
  back?: string;
}

export interface ControlsProps {
  variant: ControlsVariant;
  setVariant: (next: ControlsVariant) => void;
  onCast: () => void;
  onReset: () => void;
  canCast: boolean;
}

/** Right-side rail — cycles connector/energy-art variants, cast/reset actions. */
export function Controls(props: ControlsProps): JSX.Element;
