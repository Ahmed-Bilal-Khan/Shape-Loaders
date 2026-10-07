import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  DEFAULT_DURATION,
  Hexagon,
  VARIANTS,
  type LoaderCap,
  type LoaderEasing,
  type LoaderVariant,
} from "shape-loaders";
import { ColorPicker, Dropdown } from "./controls";
import {
  CloseIcon,
  GitHubIcon,
  MenuIcon,
  NpmIcon,
  SwapText,
  useNarrow,
  usePopover,
  useSlidingPill,
} from "./motion";
import { NPM_URL, REPO_URL, SHAPES, VARIANT_INFO, type Shape } from "./registry";

function useRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function App() {
  const [page, param] = useRoute();
  const [query, setQuery] = useState("");
  const matches = SHAPES.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()));
  const shape = SHAPES.find((s) => s.id === page);
  const variant = VARIANTS.find((v) => v === param) ?? "trace";

  return (
    <div className="layout">
      <Sidebar current={page ?? ""} query={query} onQuery={setQuery} shapes={matches} />
      <main className="main">
        {shape ? (
          <ShapePage key={`${shape.id}/${variant}`} shape={shape} initialVariant={variant} />
        ) : page === "install" ? (
          <InstallPage />
        ) : (
          <Overview shapes={matches} />
        )}
      </main>
    </div>
  );
}

function Sidebar({
  current,
  query,
  onQuery,
  shapes,
}: {
  current: string;
  query: string;
  onQuery: (query: string) => void;
  shapes: Shape[];
}) {
  const link = (id: string, label: string, glyph?: ReactNode) => (
    <a key={id} href={`#/${id}`} className="nav-link" aria-current={current === id ? "page" : undefined}>
      {glyph}
      {label}
    </a>
  );
  // On small screens the sidebar collapses to a bar, and its contents open as a menu.
  const narrow = useNarrow();
  const { open, setOpen, root, phase } = usePopover<HTMLElement>();
  useEffect(() => setOpen(false), [current, narrow]);

  return (
    <aside className="sidebar" ref={root}>
      <div className="sidebar-bar">
        <a href="#/" className="brand">
          <Hexagon size={22} variant="trace" duration={1800} aria-hidden="true" />
          Shape Loaders
        </a>
        <button
          type="button"
          className="menu-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(!open)}
        >
          <span className="t-icon-swap" data-state={open ? "b" : "a"}>
            <MenuIcon className="t-icon" data-icon="a" />
            <CloseIcon className="t-icon" data-icon="b" />
          </span>
        </button>
      </div>
      <div
        id="site-menu"
        className={narrow ? `sidebar-body t-dropdown ${phase}` : "sidebar-body"}
        data-origin="top-right"
        inert={narrow && !open}
      >
        <input
          type="search"
          className="search"
          placeholder="Search shapes"
          aria-label="Search shapes"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter opens the first match.
            if (e.key === "Enter" && shapes[0]) window.location.hash = `#/${shapes[0].id}`;
          }}
        />
        <nav className="nav" aria-label="Main">
          {link("", "Overview")}
          {link("install", "Install")}
          <span className="nav-label">Shapes</span>
          {shapes.map((s) =>
            link(s.id, s.name, <s.Component size={16} strokeWidth={5} paused={current !== s.id} aria-hidden="true" />),
          )}
          {shapes.length === 0 && <span className="nav-empty">No shapes match “{query.trim()}”.</span>}
        </nav>
        <div className="sidebar-foot">
          <a href={REPO_URL} className="nav-link">
            <GitHubIcon />
            GitHub
          </a>
          <a href={NPM_URL} className="nav-link">
            <NpmIcon />
            npm
          </a>
          <p className="credit">
            by{" "}
            <a href="https://www.linkedin.com/in/ahmedbkhan/" target="_blank" rel="noreferrer">
              Ahmed Bilal Khan
            </a>
          </p>
        </div>
      </div>
    </aside>
  );
}

function Overview({ shapes }: { shapes: Shape[] }) {
  return (
    <>
      <header className="hero">
        <h1>
          Loading indicators,
          <br />
          <span>drawn from simple shapes.</span>
        </h1>
        <p className="lede">
          {SHAPES.length * VARIANTS.length} SVG loaders for React. No dependencies and no stylesheet to import. Install
          the package, or copy the source into your project.
        </p>
        <InstallTabs />
      </header>

      <section aria-labelledby="chart-title">
        <div className="section-head">
          <h2 id="chart-title">Every shape, every animation</h2>
          <p>Pick one to open it in the playground.</p>
        </div>
        {shapes.length === 0 && (
          <p className="chart-empty">No shapes match your search. Clear it to see all {SHAPES.length}.</p>
        )}
        <div className="chart-scroll" hidden={shapes.length === 0}>
          <div className="chart">
            <span />
            {VARIANTS.map((v) => (
              <span key={v} className="chart-col">
                {VARIANT_INFO[v].name}
              </span>
            ))}
            {shapes.map((s) => (
              <div key={s.id} className="chart-row">
                <a href={`#/${s.id}`} className="chart-name">
                  {s.name}
                </a>
                {VARIANTS.map((v) => (
                  <a
                    key={v}
                    href={`#/${s.id}/${v}`}
                    className="chart-cell"
                    aria-label={`${s.name}, ${VARIANT_INFO[v].name}`}
                  >
                    <s.Component variant={v} size={28} aria-hidden="true" />
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const COMMANDS = {
  npm: { label: "npm package", command: "npm install shape-loaders" },
  npx: { label: "Copy source", command: "npx shape-loaders add circle" },
};

function InstallTabs() {
  const [tab, setTab] = useState<keyof typeof COMMANDS>("npm");
  return (
    <div className="install">
      <Segmented
        label="Install method"
        value={tab}
        onChange={setTab}
        options={[
          ["npm", COMMANDS.npm.label],
          ["npx", COMMANDS.npx.label],
        ]}
      />
      <Code code={COMMANDS[tab].command} prompt />
    </div>
  );
}

const TOKENS =
  /(?<str>"[^"]*")|(?<kw>\b(?:import|from|export|const|return)\b)|(?<cmd>^(?:npm|npx)\b)|(?<flag>--[a-z-]+)|(?<comp>\b[A-Z][A-Za-z]*\b)|(?<attr>\b[a-z][A-Za-z]*(?==))|(?<num>\b\d+(?:\.\d+)?\b)/gm;

// Just enough colouring for the short snippets and commands this site shows.
function highlight(code: string) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKENS)) {
    const index = match.index ?? 0;
    const kind = Object.keys(match.groups ?? {}).find((key) => match.groups?.[key] !== undefined);
    out.push(
      code.slice(last, index),
      <span key={index} className={`tok-${kind}`}>
        {match[0]}
      </span>,
    );
    last = index + match[0].length;
  }
  out.push(code.slice(last));
  return out;
}

function Code({ code, prompt }: { code: string; prompt?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="code">
      <pre>
        {prompt && <span className="code-prompt">$ </span>}
        {highlight(code)}
      </pre>
      <button type="button" className="copy" onClick={copy}>
        <span aria-live="polite">
          <SwapText text={copied ? "Copied" : "Copy"} />
        </span>
      </button>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  fill,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
  /** Stretch to the container, with equal-width options. */
  fill?: boolean;
}) {
  const { bar, pill } = useSlidingPill(value);
  return (
    <div className={fill ? "segmented segmented-fill" : "segmented"} role="group" aria-label={label} ref={bar}>
      <span className="t-tabs-pill" aria-hidden="true" ref={pill} />
      {options.map(([id, text]) => (
        <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)}>
          {text}
        </button>
      ))}
    </div>
  );
}

const SIZE_PX = { sm: 16, md: 24, lg: 40 };
const COLORS: [string, string][] = [
  ["currentColor", "Inherit"],
  ["#2743F5", "Cobalt"],
  ["#E5484D", "Red"],
  ["#12A594", "Teal"],
  ["#F5A524", "Amber"],
];
// Shows a small live sample of each animation in the Animation menu. Set to false to turn it off.
const MENU_PREVIEWS = true;

const DEFAULTS = {
  size: "md" as keyof typeof SIZE_PX,
  cap: "round" as LoaderCap,
  easing: "linear" as LoaderEasing,
  color: "currentColor",
  duration: DEFAULT_DURATION,
  stroke: 4,
  // Percent.
  opacity: 100,
};

function ShapePage({ shape, initialVariant }: { shape: Shape; initialVariant: LoaderVariant }) {
  const [variant, setVariantState] = useState(initialVariant);
  const [opts, setOpts] = useState(DEFAULTS);
  const [extra, setExtra] = useState(shape.extra?.initial);
  const [source, setSource] = useState<"npm" | "npx">("npm");
  const set = (patch: Partial<typeof DEFAULTS>) => setOpts((o) => ({ ...o, ...patch }));

  const setVariant = (v: LoaderVariant) => {
    setVariantState(v);
    // Keep the URL shareable without remounting the page.
    history.replaceState(null, "", `#/${shape.id}/${v}`);
  };
  const reset = () => {
    setOpts(DEFAULTS);
    setExtra(shape.extra?.initial);
  };

  const { Component, name } = shape;
  const extraProps = shape.extra && extra !== undefined ? { [shape.extra.name]: extra } : {};
  const isCustomColor = !COLORS.some(([c]) => c === opts.color);

  const props = [
    variant !== "trace" && `variant="${variant}"`,
    opts.size !== DEFAULTS.size && `size="${opts.size}"`,
    shape.extra && extra !== shape.extra.initial && `${shape.extra.name}={${extra}}`,
    opts.cap !== DEFAULTS.cap && `cap="${opts.cap}"`,
    opts.color !== DEFAULTS.color && `color="${opts.color}"`,
    opts.easing !== DEFAULTS.easing && `easing="${opts.easing}"`,
    opts.duration !== DEFAULTS.duration && `duration={${opts.duration}}`,
    opts.stroke !== DEFAULTS.stroke && `strokeWidth={${opts.stroke}}`,
    opts.opacity !== DEFAULTS.opacity && `opacity={${opts.opacity / 100}}`,
  ].filter(Boolean);
  const from = source === "npm" ? "shape-loaders" : `@/components/shape-loaders/${shape.id}`;
  const snippet = `import { ${name} } from "${from}";\n\n<${name}${props.length ? ` ${props.join(" ")}` : ""} />`;

  return (
    <>
      <header className="page-head">
        <p className="crumb">Shape</p>
        <h1>{name}</h1>
        <p className="lede">{shape.about}</p>
      </header>

      <section className="playground" aria-label="Playground">
        <div className="stage">
          <Component
            variant={variant}
            size={opts.size}
            cap={opts.cap}
            color={opts.color}
            easing={opts.easing}
            duration={opts.duration}
            strokeWidth={opts.stroke}
            opacity={opts.opacity / 100}
            {...extraProps}
          />
          <span className="stage-note">
            {SIZE_PX[opts.size]} × {SIZE_PX[opts.size]} px
          </span>
        </div>

        <div className="controls">
          <Field label="Animation">
            <Dropdown
              label="Animation"
              value={variant}
              onChange={setVariant}
              options={VARIANTS.map((v) => [v, VARIANT_INFO[v].name])}
              preview={
                MENU_PREVIEWS
                  ? (v) => <Component variant={v} size={18} cap={opts.cap} {...extraProps} aria-hidden="true" />
                  : undefined
              }
            />
          </Field>
          <Field label="Size">
            <Segmented
              fill
              label="Size"
              value={opts.size}
              onChange={(size) => set({ size })}
              options={[
                ["sm", "Small"],
                ["md", "Medium"],
                ["lg", "Large"],
              ]}
            />
          </Field>
          <Field label="Ends">
            <Segmented
              fill
              label="Ends"
              value={opts.cap}
              onChange={(cap) => set({ cap })}
              options={[
                ["round", "Round"],
                ["flat", "Flat"],
              ]}
            />
          </Field>
          <Field label="Easing">
            <Segmented
              fill
              label="Easing"
              value={opts.easing}
              onChange={(easing) => set({ easing })}
              options={[
                ["linear", "Linear"],
                ["ease", "Ease"],
                ["stacked", "Stacked"],
              ]}
            />
          </Field>
          <Field label="Color">
            <div className="swatches">
              {COLORS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className="swatch"
                  style={{ background: value }}
                  aria-label={label}
                  title={label}
                  aria-pressed={opts.color === value}
                  onClick={() => set({ color: value })}
                />
              ))}
              <ColorPicker
                value={isCustomColor ? opts.color : "#8c8c8c"}
                active={isCustomColor}
                onChange={(color) => set({ color })}
              />
            </div>
          </Field>
          <Slider
            label="Speed"
            value={opts.duration}
            min={200}
            max={4000}
            step={50}
            unit=" ms"
            onChange={(duration) => set({ duration })}
          />
          <Slider
            label="Stroke"
            value={opts.stroke}
            min={2}
            max={8}
            step={0.5}
            onChange={(stroke) => set({ stroke })}
          />
          <Slider
            label="Opacity"
            value={opts.opacity}
            min={10}
            max={100}
            step={5}
            unit="%"
            onChange={(opacity) => set({ opacity })}
          />
          {shape.extra && extra !== undefined && (
            <Slider
              label={shape.extra.label}
              value={extra}
              min={shape.extra.min}
              max={shape.extra.max}
              step={1}
              onChange={setExtra}
            />
          )}
          <button type="button" className="reset" onClick={reset}>
            Reset controls
          </button>
        </div>
      </section>

      <section className="snippet" aria-label="Code">
        <Segmented
          label="Import from"
          value={source}
          onChange={setSource}
          options={[
            ["npm", COMMANDS.npm.label],
            ["npx", "Copied source"],
          ]}
        />
        <Code code={snippet} />
      </section>

      <section aria-labelledby="variants-title">
        <div className="section-head">
          <h2 id="variants-title">Animations</h2>
        </div>
        <div className="variant-grid">
          {VARIANTS.map((v) => (
            <button
              key={v}
              type="button"
              className="variant-card"
              aria-pressed={variant === v}
              onClick={() => setVariant(v)}
            >
              <Component variant={v} size="lg" {...extraProps} aria-hidden="true" />
              <strong>{VARIANT_INFO[v].name}</strong>
              <span>{VARIANT_INFO[v].about}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  unit = "",
  onChange,
  ...range
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        <output>
          {value}
          {unit}
        </output>
      </span>
      <input
        type="range"
        value={value}
        {...range}
        style={{ "--fill": `${((value - range.min) / (range.max - range.min)) * 100}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

const PROPS: [string, string, string, string][] = [
  [
    "variant",
    '"trace" | "draw" | "dashed" | "dots" | "orbit" | "pulse" | "pulse-in" | "dot-pulse" | "dot-pulse-in" | "ripple"',
    '"trace"',
    "Animation style.",
  ],
  ["size", '"sm" | "md" | "lg" | number', '"md"', "16, 24 or 40 pixels, or any pixel value."],
  ["color", "string", "currentColor", "Any CSS color. Inherits the text color by default."],
  ["duration", "number", "1350", "Milliseconds per cycle. Lower is faster."],
  [
    "easing",
    '"linear" | "ease" | "stacked"',
    '"linear"',
    "Constant pace, slow at both ends, or a pace that swells without stopping.",
  ],
  ["cap", '"round" | "flat"', '"round"', "Shape of stroke ends, corners and dots."],
  ["strokeWidth", "number", "4", "Line thickness on the 48-unit drawing grid."],
  ["opacity", "number", "1", "From 0 to 1. A standard SVG attribute."],
  ["paused", "boolean", "false", "Freezes the animation."],
  ["label", "string", '"Loading"', "Name announced by screen readers."],
];

function InstallPage() {
  return (
    <>
      <header className="page-head">
        <p className="crumb">Guide</p>
        <h1>Install</h1>
        <p className="lede">
          Two ways to use Shape Loaders. Both need React 18 or newer, and nothing else.
        </p>
      </header>

      <section className="doc">
        <h2>Install the package</h2>
        <p>Best when you want updates through npm.</p>
        <Code code="npm install shape-loaders" prompt />
        <Code
          code={`import { Circle, Star } from "shape-loaders";\n\n<Circle />\n<Star variant="dots" size="lg" color="#2743F5" duration={800} />`}
        />
      </section>

      <section className="doc">
        <h2>Copy the source</h2>
        <p>
          Best when you want to own and edit the code. The command copies the shapes you name, plus one shared{" "}
          <code>core.tsx</code>, into <code>src/components/shape-loaders</code>.
        </p>
        <Code code="npx shape-loaders add circle star" prompt />
        <Code code="npx shape-loaders add --all --dir src/ui/loaders" prompt />
        <Code code={`import { Circle } from "@/components/shape-loaders/circle";\n\n<Circle variant="draw" />`} />
      </section>

      <section className="doc">
        <h2>Props</h2>
        <p>
          Every shape takes the same props, and passes any other SVG attribute to the <code>svg</code> element.{" "}
          <code>Star</code> adds <code>points</code> (4–8), and <code>Polygon</code> draws any regular polygon with{" "}
          <code>sides</code> (3–12).
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>What it does</th>
              </tr>
            </thead>
            <tbody>
              {PROPS.map(([prop, type, initial, about]) => (
                <tr key={prop}>
                  <td>
                    <code>{prop}</code>
                  </td>
                  <td>
                    <code>{type}</code>
                  </td>
                  <td>
                    <code>{initial}</code>
                  </td>
                  <td>{about}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="doc">
        <h2>Accessibility</h2>
        <p>
          Each loader renders with <code>role="status"</code> and the label “Loading”. Change it with the{" "}
          <code>label</code> prop, or pass <code>aria-hidden</code> when nearby text already says what is loading.
          Animations run at half speed for people who ask their system to reduce motion.
        </p>
      </section>
    </>
  );
}
