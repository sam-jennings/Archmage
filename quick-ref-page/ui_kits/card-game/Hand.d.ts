import { CardVariant } from './Card';

export interface HandCard {
  key: string;
  v: number;
  e: string;
}

export interface HandProps {
  cards: HandCard[];
  onPick: (card: HandCard) => void;
  variant?: CardVariant;
}

/** Fanned hand of cards along the bottom edge, with hover lift and click-to-stage. */
export function Hand(props: HandProps): JSX.Element;
