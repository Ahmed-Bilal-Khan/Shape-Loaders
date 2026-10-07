import { ShapeLoader, outline, ring, type Geometry, type LoaderProps } from "./core";

const geometry: Geometry = {
  d: "M24 5a19 19 0 1 1 0 38a19 19 0 1 1 0-38Z",
  dots: outline(ring(8, 19)).dots,
};

export function Circle(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
