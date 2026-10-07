import { ShapeLoader, outline, ring, type LoaderProps } from "./core";

export interface PolygonProps extends LoaderProps {
  /** Number of sides, 3–12. Defaults to 3, a triangle. */
  sides?: number;
}

export function Polygon({ sides = 3, ...props }: PolygonProps) {
  const n = Math.min(12, Math.max(3, Math.round(sides)));
  const geometry = outline(ring(n, 20), n <= 3 ? 3 : n <= 6 ? 2 : 1);
  return <ShapeLoader geometry={geometry} {...props} />;
}
