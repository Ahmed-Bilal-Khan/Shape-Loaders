import { ShapeLoader, outline, type LoaderProps } from "./core";

// Equilateral, centred by its bounding box rather than its centroid so it sits level with other shapes.
const geometry = outline([[24, 7.5], [43, 40.5], [5, 40.5]], 3);

export function Triangle(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
