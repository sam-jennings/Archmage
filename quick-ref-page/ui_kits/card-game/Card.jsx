// Card.jsx — React wrapper that drives a DOM re-render when variant changes
const { useRef, useEffect } = React;

export function Card({ value, element, variant = {}, scale = 1, style = {}, onClick }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (value === 0 || element === 'wild') {
      ref.current.innerHTML = ArchmageCards.makeWildCard({ scale });
    } else {
      ref.current.innerHTML = ArchmageCards.makeCard(value, element, { ...variant, scale });
    }
  }, [value, element, variant.connector, variant.art, variant.back, scale]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        width: 252 * scale,
        height: 352 * scale,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform .25s cubic-bezier(.2,.8,.2,1), filter .25s',
        ...style
      }}
    />
  );
}
// window.ACard is the legacy global name — Hand.jsx (and the raw-script dev preview)
// reference it as a bare identifier, so it is kept alongside the `Card` export above.
window.ACard = Card;
