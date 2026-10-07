import { ShapeLoader, curve, type LoaderProps } from "./core";

// An outer arc from tip to tip around the left, then a shallower inner arc back.
const OUTER = 20;
const TIP = (55 * Math.PI) / 180;
const INNER_X = 14;
const tipX = OUTER * Math.cos(TIP) - INNER_X;
const tipY = OUTER * Math.sin(TIP);
const inner = Math.hypot(tipX, tipY);
const innerTip = Math.atan2(tipY, tipX);

const geometry = curve((t) => {
  if (t < 0.6) {
    const angle = -TIP - (t / 0.6) * (2 * Math.PI - 2 * TIP);
    return [28 + OUTER * Math.cos(angle), 24 + OUTER * Math.sin(angle)];
  }
  const angle = innerTip + ((t - 0.6) / 0.4) * (2 * Math.PI - 2 * innerTip);
  return [28 + INNER_X + inner * Math.cos(angle), 24 + inner * Math.sin(angle)];
}, 8);

export function Crescent(props: LoaderProps) {
  return <ShapeLoader geometry={geometry} {...props} />;
}
