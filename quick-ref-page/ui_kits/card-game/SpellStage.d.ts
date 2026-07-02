import { CardVariant } from './Card';

export interface SpellStageCard {
  key: string;
  v: number;
  e: string;
}

export interface SpellStageProps {
  cards: SpellStageCard[];
  variant?: CardVariant;
  onRemove: (card: SpellStageCard) => void;
  pulse?: boolean;
}

/** Center play zone where staged cards bind into a spell (consecutive-bloom fan). */
export function SpellStage(props: SpellStageProps): JSX.Element;
