import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

// How tall the word gets at maximum stretch, as a fraction of the viewport
// height (measured at the top of the caps). 1 = caps reach the very top of the
// screen; lower = a shorter, less extreme stretch. Tune this to taste.
const MAX_FILL = 0.56;

// Height of the tallest glyph ABOVE the baseline, per 1px of font-size,
// measured with the real webfont. The word is pinned at its baseline to the
// bottom edge, so this ascent is exactly what must reach the top of the screen
// for the word to fill the viewport height. Descenders (e.g. the J in
// BHARDWAJ) fall below the edge and must NOT be counted, or the word would
// stop short of full height. Cached canvas context.
let measureCtx;
function ascentRatio(text) {
  measureCtx = measureCtx || document.createElement("canvas").getContext("2d");
  measureCtx.font = '900 100px "Archivo", system-ui, sans-serif';
  const m = measureCtx.measureText(text);
  return (m.actualBoundingBoxAscent ?? 72) / 100;
}

export default function Footer() {
  const sectionRef = useRef(null);
  const wordmarkRef = useRef(null);

  // Size the wordmark so it spans the full viewport WIDTH. A fixed vw size can
  // only approximate this for a given word; measuring the rendered text and
  // scaling the font-size to fill the screen makes it exact for any word.
  // Height is handled separately by the scaleY stretch below. Re-fits on
  // resize and once the webfont loads (fallback metrics differ).
  useLayoutEffect(() => {
    const el = wordmarkRef.current;
    if (!el) return;

    const fitWidth = () => {
      el.style.fontSize = "100px";
      const naturalW = el.scrollWidth;
      if (!naturalW) return;
      el.style.fontSize = `${(window.innerWidth / naturalW) * 100}px`;
    };

    fitWidth();
    const onResize = () => {
      fitWidth();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    let cancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (cancelled) return;
        fitWidth();
        ScrollTrigger.refresh();
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Scoped so every tween + ScrollTrigger created here is reverted together
    // on unmount / HMR — no duplicate triggers stacking up.
    const ctx = gsap.context(() => {
      // The wordmark is pinned to the bottom of the viewport (CSS fixed) and
      // stretched VERTICALLY as you scroll into the footer: width is untouched
      // (scaleX stays 1) while height grows from nothing (scaleY 0) up to the
      // factor that makes it fill the full viewport height. transform-origin is
      // the baseline (set in CSS) so it grows UPWARD from the bottom edge.
      // Because it is scrubbed, scrolling back up squashes it flat again.
      gsap.fromTo(
        wordmarkRef.current,
        { scaleY: 0 },
        {
          // Cap the stretch at MAX_FILL of the viewport height: the ascent
          // (baseline → top of the caps) at the current font-size is
          // fontSize * ascentRatio, so the factor that makes it reach
          // MAX_FILL * innerHeight is (MAX_FILL * innerHeight) / ascent.
          // Function-based + invalidateOnRefresh so it recomputes when the
          // font-size or metrics settle (resize, webfont load).
          scaleY: () => {
            const el = wordmarkRef.current;
            const fs = parseFloat(getComputedStyle(el).fontSize);
            const ascent = fs * ascentRatio(el.textContent);
            return ascent ? (window.innerHeight * MAX_FILL) / ascent : 1;
          },
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            // Start once the footer fills the viewport (its top hits the top of
            // the screen) so the full stretch plays out over the last viewport
            // of scroll, while the footer is what you're looking at.
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, sectionRef);

    // Lazy-loaded project images above change the page height after mount,
    // which moves this footer's trigger points. Recompute once things settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 600);

    return () => {
      window.removeEventListener("load", refresh);
      clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return (
    <section className="footer-reveal" ref={sectionRef} aria-label="End">
      <div className="footer-panel">
        <h2 ref={wordmarkRef} className="footer-wordmark">
          BHARDWAJ
        </h2>
      </div>
    </section>
  );
}
