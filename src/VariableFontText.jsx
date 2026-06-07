import { useEffect, useRef } from 'react';
import './VariableFontText.css';
 
export const DEFAULTS = { 
  thinWght: 100,
  thinWdth: 25, 
  boldWght: 820,
  boldWdth: 151, 
  entranceDuration: 0.9, // seconds
  entranceEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  stagger: 0.045,  
  pinchRadius: 150, // px
  hoverTransition: '0.25s ease-out', 
  inViewThreshold: 0.6,
};

const NBSP = ' ';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 
const fvs = (wght, wdth) => `"wght" ${wght}, "wdth" ${wdth}`;
 
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
 
    if (prefersReducedMotion) {
      spans.forEach((s) => {
        s.style.fontVariationSettings = fvs(boldWght, boldWdth);
      });
      return;
    }
 
    spans.forEach((s) => {
      s.style.transition = 'none';
      s.style.transitionDelay = '0s';
      s.style.fontVariationSettings = fvs(thinWght, thinWdth);
    });

    let entranceDone = false;
    let entranceTimer = 0;
    let inView = false;
    let rafId = 0;
    let lastEvent = null;
 
    const runEntrance = () => {
      entranceDone = false;
      if (entranceTimer) clearTimeout(entranceTimer); 
      spans.forEach((s) => {
        s.style.transition = 'none';
        s.style.transitionDelay = '0s';
        s.style.fontVariationSettings = fvs(thinWght, thinWdth);
      });
      void root.offsetWidth; 
      spans.forEach((s, i) => {
        s.style.transition = `font-variation-settings ${entranceDuration}s ${entranceEasing}`;
        s.style.transitionDelay = `${i * stagger}s`;
        s.style.fontVariationSettings = fvs(boldWght, boldWdth);
      });
      const totalMs =
        (entranceDuration + stagger * (spans.length - 1)) * 1000 + 30;
      entranceTimer = window.setTimeout(() => {
        entranceDone = true; 
        spans.forEach((s) => {
          s.style.transition = `font-variation-settings ${hoverTransition}`;
          s.style.transitionDelay = '0s';
        });
      }, totalMs);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !inView) {
            inView = true;
            runEntrance();
          } else if (!e.isIntersecting && inView) { 
            inView = false;
            entranceDone = false;
            if (entranceTimer) {
              clearTimeout(entranceTimer);
              entranceTimer = 0;
            }
          }
        }
      },
      { threshold: inViewThreshold }
    );
    io.observe(root);
 
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
      if (entranceTimer) clearTimeout(entranceTimer);
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
