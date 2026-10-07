import { ShapeLoader, outline, type LoaderProps } from "./core";

const geometry = outline([[7, 7], [41, 7], [41, 41], [7, 41]], 2);

export function Square(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
