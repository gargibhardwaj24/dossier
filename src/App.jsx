import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import ScrollBackground from './ScrollBackground';
import FixedVideoBg from './FixedVideoBg';
import HeroReveal from './HeroReveal';
import Hero from './Hero';
import DiveIntro from './DiveIntro';
import IntroLoader from './IntroLoader';
import './IntroLoader.css';

// Skip the whole intro for users who prefer reduced motion.
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const sections = [
  { eyebrow: '03 — STUDIO',  title: 'made in motion' },
  { eyebrow: '04 — PROCESS', title: 'curious by default' },
  { eyebrow: '05 — CLIENTS', title: 'people we love' },
  { eyebrow: '06 — CONTACT', title: 'say hello' },
];

const sectionStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '0 6vw',
  position: 'relative',
  color: '#efe9d8',
};

const eyebrowStyle = {
  fontFamily: 'Archivo, system-ui, sans-serif',
  fontSize: 13,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  opacity: 0.7,
  margin: 0,
};

const titleStyle = {
  fontFamily: 'Instrument Serif, Georgia, serif',
  fontStyle: 'italic',
  fontWeight: 400,
  fontSize: 'clamp(48px, 9vw, 140px)',
  lineHeight: 1.02,
  letterSpacing: '-0.02em',
  margin: '24px 0 0',
};

const bodyStyle = {
  maxWidth: 520,
  marginTop: 28,
  opacity: 0.75,
  fontSize: 17,
  lineHeight: 1.55,
};

export default function App() {
  // showIntro: the loader is mounted. The signature writing, loader slide-up,
  // and page rise are all driven by CSS on matching timers (see IntroLoader.css).
  const [showIntro, setShowIntro] = useState(!prefersReducedMotion);
  // Whether the 03 — STUDIO section (or anything below it) is in view. The
  // background video zooms in from here down and zooms back out above it.
  const [studioReached, setStudioReached] = useState(false);
  const studioRef = useRef(null);
  const lenisRef = useRef(null);

  // Stop the browser from restoring the previous scroll position on refresh —
  // otherwise the page rises in showing wherever you were (e.g. DiveIntro) and
  // then snaps to the top.
  useEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  // Lock scrolling and pin to the top while the intro is on screen, so the
  // page always rises in from the hero.
  useEffect(() => {
    if (!showIntro) return;
    window.scrollTo(0, 0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showIntro]);

  // Toggle the background-video zoom based on the 03 — STUDIO section. Zoomed in
  // once it reaches the middle of the viewport (and stays zoomed for everything
  // below it), zoomed back out whenever you scroll above it again.
  useEffect(() => {
    const el = studioRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Intersecting → section overlaps the middle band. top < 0 → section has
        // scrolled above the band (we're below it). Either way: stay zoomed in.
        setStudioReached(entry.isIntersecting || entry.boundingClientRect.top < 0);
      },
      // Middle band of the viewport — the user has clearly "reached" the section
      // rather than just barely peeking it.
      { rootMargin: '-35% 0px -35% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Only run Lenis once the intro is done — keeping it out of the intro window
  // means it can't drift the scroll position behind the loader.
  useEffect(() => {
    if (showIntro) return;
    const lenis = new Lenis({
      duration: 0.8,
      // expo ease-out — strong, settles smoothly
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    lenis.scrollTo(0, { immediate: true });
    let id = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [showIntro]);

  return (
    <>
      {showIntro && <IntroLoader onComplete={() => setShowIntro(false)} />}
      <ScrollBackground zoomed={studioReached} />
      <FixedVideoBg />
      <main className="site-main" style={{ position: 'relative', zIndex: 1 }}>
        <HeroReveal />
        <DiveIntro />
        <Hero />
        {sections.map((s, i) => (
          <section
            key={i}
            ref={i === 0 ? studioRef : undefined}
            style={sectionStyle}
            id={i === sections.length - 1 ? 'contact' : undefined}
          >
            <p style={eyebrowStyle}>{s.eyebrow}</p>
            <h2 style={titleStyle}>{s.title}</h2>
            <p style={bodyStyle}>
              Dummy section {i + 3}. Scroll to see the background morph and shift.
              Replace with real content once the motion feels right.
            </p>
          </section>
        ))}
      </main>
    </>
  );
}
