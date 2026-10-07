import { ShapeLoader, outline, ring, type LoaderProps } from "./core";

const geometry = outline(ring(5, 20), 2);

export function Pentagon(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
