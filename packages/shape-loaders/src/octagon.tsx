import { ShapeLoader, outline, ring, type LoaderProps } from "./core";

// Half a step of turn puts a flat edge on top, like a stop sign.
const geometry = outline(ring(8, 20, 1, 0.5));

export function Octagon(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
