import { ShapeLoader, curve, type LoaderProps } from "./core";

const geometry = curve((t) => {
  const angle = t * Math.PI * 2 - Math.PI / 2;
  return [24 + 20 * Math.cos(angle), 24 + 13 * Math.sin(angle)];
}, 8);

export function Oval(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
