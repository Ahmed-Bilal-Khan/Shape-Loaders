import { ShapeLoader, type Geometry, type LoaderProps } from "./core";

// 2:1, so six dots land on every corner and both long-edge midpoints.
const geometry: Geometry = {
  d: "M4 14L44 14L44 34L4 34Z",
  dots: [[4, 14], [24, 14], [44, 14], [44, 34], [24, 34], [4, 34]],
};

export function Rectangle(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
