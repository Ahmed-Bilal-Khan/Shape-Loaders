import { ShapeLoader, outline, type LoaderProps } from "./core";

const geometry = outline([[14, 12], [44, 12], [34, 36], [4, 36]], 2);

export function Parallelogram(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
