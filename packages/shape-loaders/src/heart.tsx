import { ShapeLoader, curve, type LoaderProps } from "./core";

// The classic heart curve, starting at the cleft and running clockwise.
const geometry = curve((t) => {
  const a = t * Math.PI * 2;
  const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
  return [24 + 19.2 * Math.sin(a) ** 3, 21 - 1.2 * y];
}, 10);

export function Heart(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
