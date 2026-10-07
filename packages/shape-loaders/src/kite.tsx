import { ShapeLoader, outline, type LoaderProps } from "./core";

const geometry = outline([[24, 3], [39, 18], [24, 45], [9, 18]], 2);

export function Kite(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
