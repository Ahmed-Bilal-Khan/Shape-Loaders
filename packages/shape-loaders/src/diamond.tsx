import { ShapeLoader, outline, type LoaderProps } from "./core";

const geometry = outline([[24, 3], [41, 24], [24, 45], [7, 24]], 2);

export function Diamond(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
