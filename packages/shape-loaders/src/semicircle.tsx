import { ShapeLoader, curve, type LoaderProps } from "./core";

// First half of t draws the arc over the top, second half the flat edge back.
const geometry = curve((t) => {
  if (t >= 0.5) return [44 - (t - 0.5) * 80, 34];
  const angle = Math.PI + t * 2 * Math.PI;
  return [24 + 20 * Math.cos(angle), 34 + 20 * Math.sin(angle)];
}, 8);

export function Semicircle(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
