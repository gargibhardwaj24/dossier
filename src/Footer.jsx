import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

const MAX_FILL = 0.56;

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

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordmarkRef.current,
        { scaleY: 0 },
        {
          scaleY: () => {
            const el = wordmarkRef.current;
            const fs = parseFloat(getComputedStyle(el).fontSize);
            const ascent = fs * ascentRatio(el.textContent);
            return ascent ? (window.innerHeight * MAX_FILL) / ascent : 1;
          },
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, sectionRef);

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
