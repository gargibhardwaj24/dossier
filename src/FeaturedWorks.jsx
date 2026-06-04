import { forwardRef, useEffect, useRef } from 'react';
import VariableFontText from './VariableFontText';
import './FeaturedWorks.css';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Placeholder images via picsum.photos (swap these out for real project shots).
// `span` controls layout: 'big' = full-width slide, 'half' = sits in a 2-up row.
const PROJECTS = [
  { seed: 'aurora',  title: 'Aurora',   tag: 'Brand · Web',     span: 'big' },
  { seed: 'meridian', title: 'Meridian', tag: 'Identity',        span: 'half' },
  { seed: 'cobalt',  title: 'Cobalt',   tag: 'Motion',          span: 'half' },
  { seed: 'verde',   title: 'Verde',    tag: 'Art Direction',   span: 'big' },
  { seed: 'ember',   title: 'Ember',    tag: 'Product · Web',   span: 'big' },
];

function Slide({ seed, title, tag, span }) {
  // Bigger source for full-width slides, narrower for the 2-up row.
  const src =
    span === 'big'
      ? `https://picsum.photos/seed/${seed}/1600/900`
      : `https://picsum.photos/seed/${seed}/900/1000`;
  // Tiny same-seed source — scaled up with image-rendering:pixelated it becomes
  // a blocky version of the exact same photo, crossfaded in on hover.
  const pxSrc =
    span === 'big'
      ? `https://picsum.photos/seed/${seed}/64/36`
      : `https://picsum.photos/seed/${seed}/40/44`;
  return (
    <a className={`proj-slide proj-slide--${span}`} href="#" onClick={(e) => e.preventDefault()}>
      <img src={src} alt={`${title} — ${tag}`} loading="lazy" draggable="false" />
      <img
        className="proj-img-px"
        src={pxSrc}
        alt=""
        aria-hidden="true"
        loading="lazy"
        draggable="false"
      />
      <div className="proj-meta">
        <span className="proj-title">{title}</span>
        <span className="proj-tag">{tag}</span>
      </div>
    </a>
  );
}

// 03 — STUDIO slot: the variable-font heading followed by the project slides.
const FeaturedWorks = forwardRef(function FeaturedWorks(_props, ref) {
  const projectsRef = useRef(null);

  // Reveal each slide (fade + rise) as it scrolls into view, once.
  useEffect(() => {
    const root = projectsRef.current;
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('.proj-slide'));

    if (prefersReducedMotion) {
      slides.forEach((s) => s.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target); // fire once per slide
          }
        }
      },
      // Trigger a touch before fully visible so the rise reads as it enters.
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="fw-section" aria-label="Featured Works">
      <VariableFontText as="h2" className="fw-heading" text="Featured Works" />

      <div className="fw-projects" ref={projectsRef}>
        {/* 1 big slide */}
        <Slide {...PROJECTS[0]} />

        {/* 2 slides adjacent, below it */}
        <div className="proj-row">
          <Slide {...PROJECTS[1]} />
          <Slide {...PROJECTS[2]} />
        </div>

        {/* then another 2 big slides */}
        <Slide {...PROJECTS[3]} />
        {/* <Slide {...PROJECTS[4]} /> */}
      </div>
    </section>
  );
});

export default FeaturedWorks;
