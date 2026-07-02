export interface CardVariant {
  connector?: string;
  art?: string;
  back?: string;
}

export interface CardProps {
  /** Card value 1–20 (or 0 for the wild card). */
  value: number;
  /** Energy key: 'radiance' | 'void' | 'flux' | 'aether' | 'wild'. */
  element: string;
  /** Connector / art / back variant selection, forwarded to lib/cards.js. */
  variant?: CardVariant;
  /** Uniform scale factor against the base 252×352 card size. Default 1. */
  scale?: number;
  style?: object;
  onClick?: () => void;
}

/** Thin React wrapper around lib/cards.js — renders a live card face SVG. */
export function Card(props: CardProps): JSX.Element;
