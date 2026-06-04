import { useEffect, useRef } from 'react';
import './VariableFontText.css';

/* ──────────────────────────────────────────────────────────────────────────
 * Tuning — these are the knobs to tweak. They're the spec defaults; every one
 * is also overridable per-instance via props (see <VariableFontText … />).
 * ──────────────────────────────────────────────────────────────────────── */
export const DEFAULTS = {
  // THIN = the "pinched" extreme: ultra-thin + condensed (entrance start / cursor).
  thinWght: 100,
  thinWdth: 25,
  // BOLD = the resting extreme: bold + wide (entrance end / away from cursor).
  boldWght: 820,
  boldWdth: 151,
  // Entrance: each letter morphs THIN → BOLD, left-to-right.
  entranceDuration: 0.9, // seconds
  entranceEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  stagger: 0.045, // seconds added per letter index
  // Hover: letters within this many px of the cursor pinch toward THIN.
  pinchRadius: 150, // px
  hoverTransition: '0.25s ease-out',
  // Entrance fires once when this fraction of the heading is visible.
  inViewThreshold: 0.6,
};

const NBSP = ' ';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Always emit the two axes in the same order so the browser can interpolate
// font-variation-settings smoothly between states.
const fvs = (wght, wdth) => `"wght" ${wght}, "wdth" ${wdth}`;

/**
 * Reusable variable-font heading. Reuse on any heading by rendering it:
 *   <VariableFontText as="h2" text="Some Heading" />
 * It tags its root with [data-variable-font-text] for styling/selection.
 */
export default function VariableFontText({
  text,
  as: Tag = 'span',
  className = '',
  thinWght = DEFAULTS.thinWght,
  thinWdth = DEFAULTS.thinWdth,
  boldWght = DEFAULTS.boldWght,
  boldWdth = DEFAULTS.boldWdth,
  entranceDuration = DEFAULTS.entranceDuration,
  entranceEasing = DEFAULTS.entranceEasing,
  stagger = DEFAULTS.stagger,
  pinchRadius = DEFAULTS.pinchRadius,
  hoverTransition = DEFAULTS.hoverTransition,
  inViewThreshold = DEFAULTS.inViewThreshold,
  ...rest
}) {
  const rootRef = useRef(null);
  const letters = [...text];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const spans = Array.from(root.querySelectorAll('[data-vft-letter]'));
    if (!spans.length) return;

    // Reduced motion: render the final BOLD state, wire up nothing else.
    if (prefersReducedMotion) {
      spans.forEach((s) => {
        s.style.fontVariationSettings = fvs(boldWght, boldWdth);
      });
      return;
    }

    // Start every letter at THIN, instantly (no transition yet).
    spans.forEach((s) => {
      s.style.transition = 'none';
      s.style.transitionDelay = '0s';
      s.style.fontVariationSettings = fvs(thinWght, thinWdth);
    });

    let entranceDone = false;
    let rafId = 0;
    let lastEvent = null;

    // ENTRANCE: THIN → BOLD, left-to-right stagger. Fires once.
    const runEntrance = () => {
      void root.offsetWidth; // flush the THIN start state before transitioning
      spans.forEach((s, i) => {
        s.style.transition = `font-variation-settings ${entranceDuration}s ${entranceEasing}`;
        s.style.transitionDelay = `${i * stagger}s`;
        s.style.fontVariationSettings = fvs(boldWght, boldWdth);
      });
      const totalMs =
        (entranceDuration + stagger * (spans.length - 1)) * 1000 + 30;
      window.setTimeout(() => {
        entranceDone = true;
        // Switch to the snappier hover transition, no per-letter delay.
        spans.forEach((s) => {
          s.style.transition = `font-variation-settings ${hoverTransition}`;
          s.style.transitionDelay = '0s';
        });
      }, totalMs);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            runEntrance();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: inViewThreshold }
    );
    io.observe(root);

    // HOVER PROXIMITY: letters near the cursor pinch toward THIN. Only after
    // the entrance has finished. Read all rects, then write — avoids layout
    // thrash — and throttle to one pass per animation frame.
    const applyProximity = () => {
      rafId = 0;
      const ev = lastEvent;
      if (!ev) return;
      const rects = spans.map((s) => s.getBoundingClientRect());
      for (let i = 0; i < spans.length; i++) {
        const r = rects[i];
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
        const t = Math.max(0, 1 - dist / pinchRadius); // 1 at cursor → 0 at radius
        const wght = Math.round(boldWght + (thinWght - boldWght) * t);
        const wdth = (boldWdth + (thinWdth - boldWdth) * t).toFixed(2);
        spans[i].style.fontVariationSettings = fvs(wght, wdth);
      }
    };

    const onMove = (ev) => {
      if (!entranceDone) return;
      lastEvent = ev;
      if (!rafId) rafId = requestAnimationFrame(applyProximity);
    };

    const onLeave = () => {
      if (!entranceDone) return;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      lastEvent = null;
      spans.forEach((s) => {
        s.style.fontVariationSettings = fvs(boldWght, boldWdth);
      });
    };

    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', onLeave);

    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      root.removeEventListener('mousemove', onMove);
      root.removeEventListener('mouseleave', onLeave);
    };
  }, [
    text,
    thinWght,
    thinWdth,
    boldWght,
    boldWdth,
    entranceDuration,
    entranceEasing,
    stagger,
    pinchRadius,
    hoverTransition,
    inViewThreshold,
  ]);

  // Initial paint matches the start state so there's no flash before the effect
  // runs: BOLD for reduced-motion, THIN otherwise.
  const initial = prefersReducedMotion
    ? fvs(boldWght, boldWdth)
    : fvs(thinWght, thinWdth);

  return (
    <Tag
      ref={rootRef}
      className={`vft ${className}`.trim()}
      data-variable-font-text=""
      {...rest}
    >
      {letters.map((ch, i) => (
        <span
          key={i}
          data-vft-letter=""
          className="vft-letter"
          style={{ fontVariationSettings: initial }}
        >
          {ch === ' ' ? NBSP : ch}
        </span>
      ))}
    </Tag>
  );
}
