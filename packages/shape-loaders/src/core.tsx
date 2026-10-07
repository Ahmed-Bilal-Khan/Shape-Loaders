import type { CSSProperties, SVGAttributes } from "react";

export type LoaderVariant = "trace" | "draw" | "dashed" | "dots" | "orbit" | "pulse" | "pulse-in" | "dot-pulse" | "dot-pulse-in" | "ripple";
export type LoaderSize = "sm" | "md" | "lg" | number;
export type LoaderCap = "round" | "flat";
export type LoaderEasing = "linear" | "ease" | "stacked";

export const VARIANTS: readonly LoaderVariant[] = [
  "trace",
  "draw",
  "dashed",
  "dots",
  "orbit",
  "pulse",
  "pulse-in",
  "dot-pulse",
  "dot-pulse-in",
  "ripple",
];

export interface LoaderProps extends Omit<SVGAttributes<SVGSVGElement>, "color" | "children" | "points"> {
  /** Animation style. Defaults to "trace". */
  variant?: LoaderVariant;
  /** "sm" (16px), "md" (24px), "lg" (40px), or any pixel value. Defaults to "md". */
  size?: LoaderSize;
  /** Any CSS color. Inherits the parent's text color by default. */
  color?: string;
  /** Milliseconds per cycle. Lower is faster. Defaults to 1350. */
  duration?: number;
  /** "linear" is constant, "ease" slows at both ends, "stacked" changes pace without stopping. Defaults to "linear". */
  easing?: LoaderEasing;
  /** Stroke ends and corners: "round" or "flat". Defaults to "round". */
  cap?: LoaderCap;
  /** Stroke width in viewBox units (the shape is drawn on a 48-unit grid). Defaults to 4. */
  strokeWidth?: number;
  /** Freezes the animation. */
  paused?: boolean;
  /** Accessible name announced by screen readers. Defaults to "Loading". */
  label?: string;
}

/** A closed outline on a 48×48 grid, plus the points where the "dots" variant places its dots. */
export interface Geometry {
  d: string;
  dots: ReadonlyArray<readonly [number, number]>;
}

export interface ShapeLoaderProps extends LoaderProps {
  geometry: Geometry;
}

type Point = readonly [number, number];

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Vertices evenly spaced around the centre, starting at the top. `inner` alternates radii to make a star;
 * `turn` rotates by a fraction of one step (0.5 puts an edge on top instead of a vertex).
 */
export function ring(count: number, radius: number, inner = 1, turn = 0): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i + turn) / count) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? radius * inner : radius;
    return [round(24 + r * Math.cos(angle)), round(24 + r * Math.sin(angle))] as const;
  });
}

/** Closes the vertices into a path and places `perEdge` dots along each edge. */
export function outline(vertices: readonly Point[], perEdge = 1): Geometry {
  const dots: Point[] = [];
  vertices.forEach(([x, y], i) => {
    const [nx, ny] = vertices[(i + 1) % vertices.length];
    for (let j = 0; j < perEdge; j++) {
      const t = j / perEdge;
      dots.push([round(x + (nx - x) * t), round(y + (ny - y) * t)]);
    }
  });
  return { d: `M${vertices.map((v) => v.join(" ")).join("L")}Z`, dots };
}

/** Samples a parametric outline (t runs 0 to 1, clockwise) into a closed path with `count` evenly spaced dots. */
export function curve(at: (t: number) => Point, count: number, steps = 120): Geometry {
  const pts = Array.from({ length: steps }, (_, i) => at(i / steps));
  const lengths = [0];
  pts.forEach(([x, y], i) => {
    const [nx, ny] = pts[(i + 1) % steps];
    lengths.push(lengths[i] + Math.hypot(nx - x, ny - y));
  });
  let seg = 0;
  const dots = Array.from({ length: count }, (_, k) => {
    const target = (k / count) * lengths[steps];
    while (lengths[seg + 1] < target) seg++;
    const [x, y] = pts[seg];
    const [nx, ny] = pts[(seg + 1) % steps];
    const t = (target - lengths[seg]) / (lengths[seg + 1] - lengths[seg] || 1);
    return [round(x + (nx - x) * t), round(y + (ny - y) * t)] as const;
  });
  return { d: "M" + pts.map(([x, y]) => round(x) + " " + round(y)).join("L") + "Z", dots };
}

const SIZES = { sm: 16, md: 24, lg: 40 };

/** Milliseconds per cycle when no `duration` is given. */
export const DEFAULT_DURATION = 1350;

// "stacked" averages linear and ease-in-out: the pace swells and settles but never reaches zero.
const EASINGS: Record<LoaderEasing, string> = {
  linear: "linear",
  ease: "ease-in-out",
  stacked: "cubic-bezier(.5,.25,.5,.75)",
};

const BASE =
  ".sl{--sl-d:var(--sl-b);overflow:visible}" +
  ".sl *{transform-origin:24px 24px}" +
  ".sl[data-paused] *{animation-play-state:paused!important}" +
  "@media (prefers-reduced-motion:reduce){.sl{--sl-d:calc(var(--sl-b)*2)}}";

// Outward ripples fade as they grow; inward ones gather from the edge and fade as they land.
const PULSE =
  "@keyframes sl-pulse{0%{transform:scale(.3);opacity:1}100%{transform:scale(1);opacity:0}}" +
  ".sl-pulse{animation:sl-pulse var(--sl-d) var(--sl-e) infinite}";
const PULSE_IN =
  "@keyframes sl-pulse-in{0%{transform:scale(1);opacity:0}65%{opacity:1}100%{transform:scale(.3);opacity:0}}" +
  ".sl-pulse-in{animation:sl-pulse-in var(--sl-d) var(--sl-e) infinite}";

const CSS: Record<LoaderVariant, string> = {
  trace:
    "@keyframes sl-trace{to{stroke-dashoffset:-100}}" +
    ".sl-trace{animation:sl-trace var(--sl-d) var(--sl-e) infinite}",
  draw:
    "@keyframes sl-draw{0%{stroke-dasharray:0 100;stroke-dashoffset:0}50%{stroke-dasharray:100 0;stroke-dashoffset:0}100%{stroke-dasharray:0 100;stroke-dashoffset:-100}}" +
    ".sl-draw{animation:sl-draw var(--sl-d) var(--sl-e) infinite}",
  dashed:
    "@keyframes sl-dashed{to{stroke-dashoffset:-25}}" +
    ".sl-dashed{animation:sl-dashed var(--sl-d) var(--sl-e) infinite}",
  dots:
    "@keyframes sl-dots{0%{opacity:1}100%{opacity:.15}}" +
    ".sl-dots>*{animation:sl-dots var(--sl-d) var(--sl-e) infinite}",
  orbit:
    "@keyframes sl-orbit{to{stroke-dashoffset:-100}}" +
    ".sl-orbit{animation:sl-orbit var(--sl-d) var(--sl-e) infinite}",
  pulse: PULSE,
  "pulse-in": PULSE_IN,
  "dot-pulse": PULSE,
  "dot-pulse-in": PULSE_IN,
  ripple: PULSE,
};

export function ShapeLoader({
  geometry,
  variant = "trace",
  size = "md",
  color,
  duration,
  easing = "linear",
  cap = "round",
  strokeWidth = 4,
  paused,
  label = "Loading",
  className,
  style,
  ...rest
}: ShapeLoaderProps) {
  const px = typeof size === "number" ? size : SIZES[size];
  const isRound = cap === "round";
  const { d, dots } = geometry;

  const stroke = {
    d,
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: isRound ? ("round" as const) : ("butt" as const),
    strokeLinejoin: isRound ? ("round" as const) : ("miter" as const),
  };
  const track = <path {...stroke} opacity={0.18} />;

  const r = strokeWidth * 0.6;
  const dot = (i: number, style?: CSSProperties) => {
    const [x, y] = dots[i];
    return isRound ? (
      <circle key={i} cx={x} cy={y} r={r} style={style} />
    ) : (
      <rect key={i} x={x - r} y={y - r} width={r * 2} height={r * 2} style={style} />
    );
  };

  let body;
  switch (variant) {
    case "draw":
      body = <path {...stroke} className="sl-draw" pathLength={100} strokeDasharray="0 100" />;
      break;
    case "dashed":
      body = (
        <path {...stroke} className="sl-dashed" pathLength={100} strokeDasharray={isRound ? "3.5 9" : "6.5 6"} />
      );
      break;
    case "dots":
      body = (
        <g className="sl-dots" fill="currentColor">
          {dots.map((_, i) =>
            dot(i, { animationDelay: `calc(var(--sl-d) * ${(i / dots.length - 1).toFixed(3)})` }),
          )}
        </g>
      );
      break;
    case "orbit":
      body = (
        <>
          <path {...stroke} strokeWidth={strokeWidth / 2} opacity={0.25} />
          <path
            {...stroke}
            className="sl-orbit"
            pathLength={100}
            strokeWidth={strokeWidth * 1.6}
            strokeDasharray={isRound ? "0 50" : "5 45"}
          />
        </>
      );
      break;
    case "pulse":
    case "pulse-in":
    case "dot-pulse":
    case "dot-pulse-in": {
      const ripple = variant.endsWith("-in") ? "sl-pulse-in" : "sl-pulse";
      const shape = variant.startsWith("dot") ? dots.map((_, i) => dot(i)) : <path d={d} />;
      body = (
        <g fill="currentColor">
          <g className={ripple}>{shape}</g>
          <g className={ripple} style={{ animationDelay: "calc(var(--sl-d) * -.5)" }}>
            {shape}
          </g>
        </g>
      );
      break;
    }
    case "ripple":
      // Three outlines spreading from the centre, a third of a cycle apart.
      body = [0, 1, 2].map((i) => (
        <path
          key={i}
          {...stroke}
          className="sl-pulse"
          style={{ animationDelay: `calc(var(--sl-d) * ${(-i / 3).toFixed(3)})` }}
        />
      ));
      break;
    default:
      body = (
        <>
          {track}
          <path {...stroke} className="sl-trace" pathLength={100} strokeDasharray="28 72" />
        </>
      );
  }

  return (
    <svg
      role="status"
      aria-label={label}
      viewBox="0 0 48 48"
      width={px}
      height={px}
      data-paused={paused ? "" : undefined}
      {...rest}
      className={className ? `sl ${className}` : "sl"}
      style={{ color, "--sl-b": `${duration && duration > 0 ? duration : DEFAULT_DURATION}ms`, "--sl-e": EASINGS[easing], ...style } as CSSProperties}
    >
      <style>{BASE + CSS[variant]}</style>
      {body}
    </svg>
  );
}
