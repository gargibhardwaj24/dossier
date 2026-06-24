import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollCurve.css';

// Plugin registration is idempotent — Footer also registers it. Doing it here
// keeps this component self-contained.
gsap.registerPlugin(ScrollTrigger);

// Below this width the curve is hidden (layout reflows too much on phones to be
// worth drawing). CSS hides the <svg>; JS skips building the ScrollTrigger.
const HIDE_BELOW = 600;

// Curve shape, expressed as cubic-Bézier segments whose points are OFFSETS from
// the base of the "I", as fractions of the region's width (x, + = right) and
// height (y, + = down). Each segment = two control points + an endpoint. Edit
// these freely to reshape the ribbon; the geometry comes entirely from here, so
// there is no CSS scaleY anywhere. Starts as a gentle S: drop, bow left, swoop
// right into the roles section, soft wave, then exit off the bottom-right.
const SEGMENTS = [
  { c1: [0.0, 0.1], c2: [-0.1, 0.16], end: [-0.08, 0.26] }, // drop, bow left
  { c1: [-0.06, 0.36], c2: [0.12, 0.34], end: [0.12, 0.47] }, // swoop right into roles
  { c1: [0.12, 0.59], c2: [-0.04, 0.64], end: [0.05, 0.76] }, // soft wave
  { c1: [0.13, 0.88], c2: [0.34, 0.9], end: [0.58, 1.05] }, // exit off bottom-right
];

// The hero headline lifts upward on scroll (Hero.css: --hero-blur drives a
// translateY of up to --hero-lift-max = 55vh). getBoundingClientRect() sees
// that transform, so we add the lift back to recover the "I"'s at-rest position
// and keep the curve's start point stable no matter where the user is scrolled.
const HERO_LIFT_VH = 0.55;

// The span's bounding box extends ~0.2em below the glyph's baseline (the line
// box's descent area). Lift the start up by this fraction of the font size so
// the stroke begins at the "I"'s visible bottom — a hair of overlap so it reads
// as the letter extending, with no gap. Tune if you see a gap or overlap.
const BASELINE_NUDGE = 0.2;

// Cached canvas for measuring the "I"'s ink width (same trick Footer uses).
let measureCtx;
function stemWidth(weight, fontSize, fontFamily) {
  measureCtx = measureCtx || document.createElement('canvas').getContext('2d');
  measureCtx.font = `${weight} ${fontSize}px ${fontFamily}`;
  const m = measureCtx.measureText('I');
  // actualBoundingBox L+R = the glyph's inked horizontal extent = stem width.
  return m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
}

// Current value of Hero's scroll-driven --hero-blur (set as an inline style on
// <html>), 0..1. Cheap to read; drives how far the headline has lifted.
function currentBlur() {
  return parseFloat(document.documentElement.style.getPropertyValue('--hero-blur')) || 0;
}

// Assemble the path `d`: an explicit start point + the precomputed downstream
// bézier points. Only the start moves per frame; the rest stays anchored.
function buildD(sx, sy, pts) {
  let d = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
  for (const p of pts) {
    d += ` C ${p.c1x.toFixed(1)} ${p.c1y.toFixed(1)}, ${p.c2x.toFixed(1)} ${p.c2y.toFixed(1)}, ${p.ex.toFixed(1)} ${p.ey.toFixed(1)}`;
  }
  return d;
}

/**
 * Draws an SVG curve from the base of the hero's standalone "I" down into the
 * roles section, scrubbed by scroll via GSAP ScrollTrigger (smoothed by the
 * Lenis instance App already drives into ScrollTrigger.update).
 *
 * `regionRef` must point at a position:relative wrapper around BOTH
 * section.hero and section.roles-section.
 */
export default function ScrollCurve({ regionRef }) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const region = regionRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!region || !svg || !path) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ctx = null;
    // Geometry shared with the per-frame tick(): rest start + downstream points.
    let frame = null;
    let lastLift = -1;

    const build = () => {
      // Tear down any previous tween + trigger before remeasuring.
      if (ctx) {
        ctx.revert();
        ctx = null;
      }
      frame = null;

      const anchor = region.querySelector('.curve-anchor');
      if (window.innerWidth < HIDE_BELOW || !anchor) {
        svg.style.display = 'none';
        return;
      }
      svg.style.display = '';

      // Region pixel box -> viewBox so 1 SVG user unit == 1 px.
      const regionRect = region.getBoundingClientRect();
      const W = regionRect.width;
      const H = regionRect.height;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

      // REST start point: bottom of the "I"'s glyph with the headline lift
      // removed. a.bottom already includes the current lift, so add it back to
      // recover the at-rest position. The downstream curve is anchored to this;
      // the LIVE start is tracked per frame in tick() so it follows the "I" as
      // the headline lifts on scroll and never detaches.
      const a = anchor.getBoundingClientRect();
      const cs = getComputedStyle(anchor);
      const fs = parseFloat(cs.fontSize) || a.height;
      const lift0 = currentBlur() * window.innerHeight * HERO_LIFT_VH;
      const sx0 = a.left + a.width / 2 - regionRect.left;
      // Lift to the glyph baseline so the curve starts AT the bottom of the "I".
      const sy0 = a.bottom - regionRect.top + lift0 - fs * BASELINE_NUDGE;

      // Match the stroke to the "I"'s stem so the line looks like the letter
      // extending. Fall back to the CSS width if metrics are unavailable.
      const stem = stemWidth(cs.fontWeight, fs, cs.fontFamily);
      if (stem > 0) path.style.strokeWidth = `${stem}`;

      // Downstream bézier points, anchored to the REST start so the lower curve
      // (into the roles section) stays put while only the start tracks the "I".
      const pts = SEGMENTS.map((s) => ({
        c1x: sx0 + s.c1[0] * W,
        c1y: sy0 + s.c1[1] * H,
        c2x: sx0 + s.c2[0] * W,
        c2y: sy0 + s.c2[1] * H,
        ex: sx0 + s.end[0] * W,
        ey: sy0 + s.end[1] * H,
      }));
      frame = { sx0, sy0, pts };
      lastLift = -1; // force tick() to redraw with the new geometry

      // Normalise the dash to the path length via pathLength=1, so tick() can
      // rewrite the geometry every frame without disturbing the draw progress.
      path.setAttribute('pathLength', '1');
      path.setAttribute('d', buildD(sx0, sy0, pts));
      path.style.strokeDasharray = '1';
      path.style.strokeDashoffset = reduce ? '0' : '1';

      if (reduce) return; // no scrubbed draw under reduced motion

      const roles = region.querySelector('.roles-section');
      ctx = gsap.context(() => {
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            // Trigger on the "I" itself so the draw STARTS from it, rather than
            // from the top of the region (which you scroll past well before the
            // "I" is in view — that's why it looked already-drawn).
            trigger: anchor,
            start: 'top 18%', // begins once the "I" has scrolled up near the top
            endTrigger: roles || region,
            end: 'bottom center', // finishes as the roles section passes center
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }, region);

      ScrollTrigger.refresh();
    };

    // Per-frame: move ONLY the path's start to follow the "I"'s live lift,
    // keeping the downstream curve anchored. Reads one inline CSS var; the
    // normalised dash keeps the drawn fraction intact as geometry changes.
    const tick = () => {
      if (!frame) return;
      const lift = currentBlur() * window.innerHeight * HERO_LIFT_VH;
      if (lift === lastLift) return;
      lastLift = lift;
      path.setAttribute('d', buildD(frame.sx0, frame.sy0 - lift, frame.pts));
    };
    gsap.ticker.add(tick);

    build();

    const onResize = () => build();
    window.addEventListener('resize', onResize);

    // The "I" position depends on layout + the webfont; rebuild once both settle.
    const onLoad = () => build();
    window.addEventListener('load', onLoad);
    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) build();
      });
    }

    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onLoad);
      if (ctx) ctx.revert();
    };
  }, [regionRef]);

  return (
    <svg
      ref={svgRef}
      className="scroll-curve"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path ref={pathRef} className="scroll-curve-path" fill="none" />
    </svg>
  );
}
