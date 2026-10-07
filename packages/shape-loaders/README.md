# Shape Loaders

[![npm version](https://img.shields.io/npm/v/shape-loaders?logo=npm)](https://www.npmjs.com/package/shape-loaders)
[![Vercel deployment](https://img.shields.io/github/deployments/Ahmed-Bilal-Khan/Shape-Loaders/Production?label=vercel&logo=vercel)](https://shape-loaders.vercel.app)

**[Try every loader in the playground →](https://shape-loaders.vercel.app)**

Minimal SVG loading indicators for React, drawn from fifteen shapes: circle, oval, semicircle, crescent, square, rectangle, parallelogram, diamond, kite, triangle, pentagon, hexagon, octagon, star and heart. Each shape comes in ten animations, three sizes, and round or flat ends.

- No dependencies, and no stylesheet to import
- Works in server components (no hooks, no client JavaScript)
- Inherits `currentColor`, respects `prefers-reduced-motion`
- Use it as a package, or copy the source into your project with `npx`

## Install

```bash
npm install shape-loaders
```

```tsx
import { Circle, Star } from "shape-loaders";

<Circle />
<Star variant="dots" size="lg" color="#2743F5" duration={800} />
```

## Copy the source instead

```bash
npx shape-loaders add circle star
```

This copies `circle.tsx`, `star.tsx` and the shared `core.tsx` into `src/components/shape-loaders`. They are yours to edit.

```bash
npx shape-loaders list
npx shape-loaders add --all --dir src/ui/loaders
```

## Props

Every shape takes the same props and passes any other SVG attribute to the `<svg>` element.

| Prop          | Type                                                             | Default        | What it does                                      |
| ------------- | ---------------------------------------------------------------- | -------------- | ------------------------------------------------- |
| `variant`     | see the list below                                               | `"trace"`      | Animation style                                   |
| `size`        | `"sm" \| "md" \| "lg" \| number`                                 | `"md"`         | 16, 24 or 40 pixels, or any pixel value           |
| `color`       | `string`                                                         | `currentColor` | Any CSS color                                     |
| `duration`    | `number`                                                         | `1350`         | Milliseconds per cycle; lower is faster           |
| `easing`      | `"linear" \| "ease" \| "stacked"`                                | `"linear"`     | Constant, slow at both ends, or swelling pace     |
| `cap`         | `"round" \| "flat"`                                              | `"round"`      | Shape of stroke ends, corners and dots            |
| `strokeWidth` | `number`                                                         | `4`            | Line thickness on the 48-unit drawing grid        |
| `opacity`     | `number`                                                         | `1`            | From 0 to 1 (a standard SVG attribute)            |
| `paused`      | `boolean`                                                        | `false`        | Freezes the animation                             |
| `label`       | `string`                                                         | `"Loading"`    | Name announced by screen readers                  |

Variants: `trace`, `draw`, `dashed`, `dots`, `orbit`, `pulse`, `pulse-in`, `dot-pulse`, `dot-pulse-in`, `ripple`.

There is also a `Polygon` component for any regular polygon: it adds `sides` (3–12, default 3). `Star` adds `points` (4–8, default 5).

### Your own shape

`ShapeLoader` animates any closed outline drawn on a 48×48 grid. Use `outline` for straight-edged shapes and `curve` for a parametric one:

```tsx
import { ShapeLoader, outline } from "shape-loaders";

const arrow = outline([[24, 4], [44, 30], [24, 22], [4, 30]], 2);

<ShapeLoader geometry={arrow} variant="orbit" />
```

## Develop

```bash
npm install
npm run dev        # docs site and playground
npm run build      # library, then site
npm run typecheck
```

- `packages/shape-loaders` is the library and the `npx` CLI
- `site` is the docs site and playground (Vite + React)

## License

MIT
