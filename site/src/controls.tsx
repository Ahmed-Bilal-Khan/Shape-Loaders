import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { usePopover } from "./motion";

export function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  preview,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
  /** Optional sample shown at the right of each option while the menu is open. */
  preview?: (value: T) => ReactNode;
}) {
  const { open, setOpen, root, phase } = usePopover();
  const list = useRef<HTMLDivElement>(null);

  // Opening moves focus to the current choice, so arrow keys start from it.
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
  }, [open]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    if (!open) return setOpen(true);
    const items = [...(list.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
    const next = items.indexOf(document.activeElement as HTMLElement) + (e.key === "ArrowDown" ? 1 : -1);
    items[Math.min(items.length - 1, Math.max(0, next))]?.focus();
  };

  return (
    <div className="dropdown" ref={root} onKeyDown={onKeyDown}>
      <button
        type="button"
        className="select"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(!open)}
      >
        {options.find(([id]) => id === value)?.[1]}
      </button>
      {/* Always mounted so it can animate out; inert keeps it out of reach while closed. */}
      <div
        className={`popover menu t-dropdown ${phase}`}
        data-origin="top-center"
        role="listbox"
        aria-label={label}
        inert={!open}
        ref={list}
      >
        {options.map(([id, text]) => (
          <button
            key={id}
            type="button"
            role="option"
            aria-selected={id === value}
            onClick={() => {
              onChange(id);
              setOpen(false);
              root.current?.querySelector<HTMLElement>(".select")?.focus();
            }}
          >
            {text}
            {preview && open && <span className="menu-preview">{preview(id)}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

type Hsv = { h: number; s: number; v: number };

function hsvToHex({ h, s, v }: Hsv) {
  const channel = (n: number) => {
    const k = (n + h / 60) % 6;
    const value = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(5)}${channel(3)}${channel(1)}`;
}

function hexToHsv(hex: string): Hsv | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? delta / max : 0, v: max };
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));

export function ColorPicker({
  value,
  active,
  onChange,
}: {
  /** The current colour as a 6-digit hex, used when `active`. */
  value: string;
  /** Whether the custom colour is the one in use. */
  active: boolean;
  onChange: (hex: string) => void;
}) {
  const { open, setOpen, root, phase } = usePopover();
  // Kept as HSV so the hue survives dragging through grey and black.
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value) ?? { h: 0, s: 0, v: 1 });
  const [text, setText] = useState(value);

  const update = (next: Hsv) => {
    setHsv(next);
    setText(hsvToHex(next));
    onChange(hsvToHex(next));
  };

  const pick = (e: PointerEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    update({ ...hsv, s: clamp((e.clientX - box.left) / box.width), v: clamp(1 - (e.clientY - box.top) / box.height) });
  };

  const nudge = (e: KeyboardEvent) => {
    const step = { ArrowLeft: [-0.02, 0], ArrowRight: [0.02, 0], ArrowUp: [0, 0.02], ArrowDown: [0, -0.02] }[e.key];
    if (!step) return;
    e.preventDefault();
    update({ ...hsv, s: clamp(hsv.s + step[0]), v: clamp(hsv.v + step[1]) });
  };

  return (
    <div className="color-picker" ref={root}>
      <button
        type="button"
        className="swatch swatch-custom"
        aria-label="Custom color"
        title="Custom color"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-active={active || undefined}
        onClick={() => {
          if (!open) onChange(hsvToHex(hsv));
          setOpen(!open);
        }}
      />
      <div
        className={`popover picker t-dropdown ${phase}`}
        data-origin="top-right"
        role="dialog"
        aria-label="Custom color"
        inert={!open}
      >
        <div
          className="picker-area"
          role="slider"
          tabIndex={0}
          aria-label="Saturation and brightness"
          aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
          style={{ "--hue": hsv.h } as CSSProperties}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            pick(e);
          }}
          onPointerMove={(e) => e.buttons === 1 && pick(e)}
          onKeyDown={nudge}
        >
          <span style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hsvToHex(hsv) }} />
        </div>
        <input
          type="range"
          className="hue"
          aria-label="Hue"
          min={0}
          max={359}
          value={Math.round(hsv.h)}
          onChange={(e) => update({ ...hsv, h: Number(e.target.value) })}
        />
        <input
          type="text"
          className="picker-hex"
          aria-label="Hex color"
          spellCheck={false}
          maxLength={7}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const parsed = hexToHsv(e.target.value);
            if (parsed) {
              setHsv(parsed);
              onChange(hsvToHex(parsed));
            }
          }}
        />
      </div>
    </div>
  );
}
