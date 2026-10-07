import type { ComponentType } from "react";
import {
  Circle,
  Crescent,
  Diamond,
  Heart,
  Hexagon,
  Kite,
  Octagon,
  Oval,
  Parallelogram,
  Pentagon,
  Rectangle,
  Semicircle,
  Square,
  Star,
  Triangle,
  type LoaderProps,
  type LoaderVariant,
} from "shape-loaders";

export const REPO_URL = "https://github.com/Ahmed-Bilal-Khan/Shape-Loaders";
export const NPM_URL = "https://www.npmjs.com/package/shape-loaders";

export interface ExtraProp {
  name: "sides" | "points";
  label: string;
  min: number;
  max: number;
  initial: number;
}

export interface Shape {
  id: string;
  name: string;
  about: string;
  Component: ComponentType<LoaderProps & { sides?: number; points?: number }>;
  extra?: ExtraProp;
}

export const SHAPES: Shape[] = [
  { id: "circle", name: "Circle", about: "The familiar spinner, in ten animations.", Component: Circle },
  { id: "oval", name: "Oval", about: "A circle, stretched. For wide, soft slots.", Component: Oval },
  { id: "semicircle", name: "Semicircle", about: "Half a circle on a flat base.", Component: Semicircle },
  { id: "crescent", name: "Crescent", about: "Two arcs meeting at two tips.", Component: Crescent },
  { id: "square", name: "Square", about: "Four equal sides. Sits well next to buttons and cards.", Component: Square },
  { id: "rectangle", name: "Rectangle", about: "A 2:1 outline, for wide slots like inputs and banners.", Component: Rectangle },
  { id: "parallelogram", name: "Parallelogram", about: "A rectangle with a lean.", Component: Parallelogram },
  { id: "diamond", name: "Diamond", about: "Four equal sides, standing on a point.", Component: Diamond },
  { id: "kite", name: "Kite", about: "A diamond with a longer tail.", Component: Kite },
  { id: "triangle", name: "Triangle", about: "Three equal sides, point up.", Component: Triangle },
  { id: "pentagon", name: "Pentagon", about: "Five sides, point up.", Component: Pentagon },
  { id: "hexagon", name: "Hexagon", about: "Six sides, point up.", Component: Hexagon },
  { id: "octagon", name: "Octagon", about: "Eight sides, flat on top.", Component: Octagon },
  {
    id: "star",
    name: "Star",
    about: "Four to eight points. Five by default.",
    Component: Star,
    extra: { name: "points", label: "Points", min: 4, max: 8, initial: 5 },
  },
  { id: "heart", name: "Heart", about: "For likes, favourites and saves.", Component: Heart },
];

export const VARIANT_INFO: Record<LoaderVariant, { name: string; about: string }> = {
  trace: { name: "Trace", about: "A segment runs around the outline." },
  draw: { name: "Draw", about: "The outline draws itself, then erases." },
  dashed: { name: "Dashed", about: "Dashes march around the outline." },
  dots: { name: "Dots", about: "Dots light up in turn." },
  orbit: { name: "Orbit", about: "Two beads travel a thin track." },
  pulse: { name: "Pulse", about: "The filled shape ripples outward." },
  "pulse-in": { name: "Pulse in", about: "The filled shape gathers inward." },
  "dot-pulse": { name: "Dot pulse", about: "A ring of dots ripples outward." },
  "dot-pulse-in": { name: "Dot pulse in", about: "A ring of dots gathers inward." },
  ripple: { name: "Ripple", about: "Outlines spread from the centre, like rings on water." },
};
