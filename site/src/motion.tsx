// Small React wrappers around the transitions.dev snippets in transitions.css.
import { useEffect, useLayoutEffect, useRef, useState, type SVGProps } from "react";

const cssMs = (name: string, fallback: number) =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;

/**
 * Open state for a popover that closes on Escape, an outside press, or focus leaving it.
 * `phase` is the transitions.dev dropdown class: "is-open", then "is-closing" until the exit finishes.
 */
export function usePopover<T extends HTMLElement = HTMLDivElement>() {
  const [open, setOpenState] = useState(false);
  const [closing, setClosing] = useState(false);
  const root = useRef<T>(null);
  const isOpen = useRef(false);

  const setOpen = (next: boolean) => {
    if (next === isOpen.current) return;
    isOpen.current = next;
    setOpenState(next);
    setClosing(!next);
    if (!next) setTimeout(() => setClosing(false), cssMs("--dropdown-close-dur", 150));
  };

  useEffect(() => {
    if (!open) return;
    const onPress = (e: Event) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      root.current?.querySelector<HTMLElement>("[aria-expanded]")?.focus();
    };
    document.addEventListener("pointerdown", onPress);
    document.addEventListener("focusin", onPress);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPress);
      document.removeEventListener("focusin", onPress);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, root, phase: open ? "is-open" : closing ? "is-closing" : "" };
}

/** True while the viewport is at or below the mobile breakpoint used in styles.css. */
export function useNarrow() {
  const query = "(max-width: 860px)";
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setNarrow(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

/** Text states swap: the old text exits upward, then the new text enters from below. */
export function SwapText({ text }: { text: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (text === shown) return;
    const node = el.current;
    node?.classList.add("is-exit");
    const timer = setTimeout(
      () => {
        setShown(text);
        if (!node) return;
        node.classList.remove("is-exit");
        node.classList.add("is-enter-start");
        void node.offsetHeight; // reflow, so the entrance transitions
        node.classList.remove("is-enter-start");
      },
      cssMs("--text-swap-dur", 150),
    );
    return () => clearTimeout(timer);
  }, [text, shown]);

  return (
    <span className="t-text-swap" ref={el}>
      {shown}
    </span>
  );
}

/**
 * Tabs sliding: positions the pill under the pressed button. The first placement and any
 * resize snap without a transition; a change of `value` slides.
 */
export function useSlidingPill(value: string) {
  const bar = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const move = (animate: boolean) => {
      const tab = bar.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
      const el = pill.current;
      if (!tab || !el) return;
      if (!animate) el.style.transition = "none";
      el.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
      el.style.width = `${tab.offsetWidth}px`;
      el.style.height = `${tab.offsetHeight}px`;
      if (!animate) {
        void el.offsetWidth;
        el.style.transition = "";
      }
    };
    move(placed.current);
    placed.current = true;
    // Also covers web fonts arriving and the layout switching breakpoints.
    const observer = new ResizeObserver(() => move(false));
    if (bar.current) observer.observe(bar.current);
    return () => observer.disconnect();
  }, [value]);

  return { bar, pill };
}

type IconProps = SVGProps<SVGSVGElement>;

const line = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const GitHubIcon = (props: IconProps) => (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export const NpmIcon = (props: IconProps) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...line} {...props} width={18} height={18}>
    <path d="M2.5 5h11M2.5 11h11" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...line} {...props} width={18} height={18}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
