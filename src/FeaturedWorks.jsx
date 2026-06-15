import { forwardRef, useEffect, useRef } from 'react';
import VariableFontText from './VariableFontText';
import cursorVid from './assets/creative.mp4';
import hushMeet from './assets/hushMeet.mp4';
import nanofacts from './assets/nanoFactz.png';
import procrastinator from './assets/procrastinator.png';
import './FeaturedWorks.css';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Placeholder images via picsum.photos (swap these out for real project shots).
// `span` controls layout: 'big' = full-width slide, 'half' = sits in a 2-up row.
const PROJECTS = [
  { seed: 'aurora',  span: 'big', video: cursorVid },
  { seed: 'procrastinator', span: 'half', photo: procrastinator, fit: 'contain' },
  { seed: 'nanofacts',      span: 'half', photo: nanofacts },
  { seed: 'verde',   span: 'big', video: hushMeet },
  { seed: 'ember',   span: 'big' },
];

function Slide({ seed, title, tag, span, side = 'left', video, photo, fit }) {
  // Bigger source for full-width slides, narrower for the 2-up row.
  const src =
    span === 'big'
      ? `https://picsum.photos/seed/${seed}/1600/900`
      : `https://picsum.photos/seed/${seed}/900/1000`;
  return (
    <a
      className={`proj-slide proj-slide--${span} proj-slide--from-${side}${
        fit === 'contain' ? ' proj-slide--contain' : ''
      }`}
      href="#"
      onClick={(e) => e.preventDefault()}
    >
      {video ? (
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          draggable="false"
          aria-label={`${title} — ${tag}`}
        />
      ) : (
        <img
          src={photo || src}
          alt={`${title} — ${tag}`}
          loading="lazy"
          draggable="false"
        />
      )}
      <div className="proj-meta">
        <span className="proj-title">{title}</span>
        <span className="proj-tag">{tag}</span>
      </div>
    </a>
  );
}

const FeaturedWorks = forwardRef(function FeaturedWorks(_props, ref) {
  const projectsRef = useRef(null);

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
          e.target.classList.toggle('is-in', e.isIntersecting);
        }
      },
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
        <Slide {...PROJECTS[0]} side="left" />

        {/* 2 slides adjacent, below it */}
        <div className="proj-row">
          <Slide {...PROJECTS[1]} side="left" />
          <Slide {...PROJECTS[2]} side="right" />
        </div>

        {/* then another 2 big slides */}
        <Slide {...PROJECTS[3]} side="right" />
        {/* <Slide {...PROJECTS[4]} /> */}
      </div>
    </section>
  );
});

export default FeaturedWorks;
