import { ShapeLoader, outline, ring, type LoaderProps } from "./core";

export interface StarProps extends LoaderProps {
  /** Number of points, 4–8. Defaults to 5. */
  points?: number;
}

export function Star({ points = 5, ...props }: StarProps) {
  const n = Math.min(8, Math.max(4, Math.round(points)));
  const geometry = outline(ring(n * 2, 21, 0.5));
  return <ShapeLoader geometry={geometry} {...props} />;
}
