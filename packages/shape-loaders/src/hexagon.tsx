import { ShapeLoader, outline, ring, type LoaderProps } from "./core";

const geometry = outline(ring(6, 20), 2);

export function Hexagon(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
