import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import ScrollBackground from './ScrollBackground';
import FixedVideoBg from './FixedVideoBg';
import HeroReveal from './HeroReveal';
import Hero from './Hero';
import FeaturedWorks from './FeaturedWorks';
import DiveIntro from './DiveIntro';
import Roles from './Roles';
import IntroLoader from './IntroLoader';
import './IntroLoader.css';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const sections = [
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
  const [showIntro, setShowIntro] = useState(!prefersReducedMotion);
  const [studioReached, setStudioReached] = useState(false);
  const studioRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    window.scrollTo(0, 0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showIntro]);

  useEffect(() => {
    const el = studioRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStudioReached(entry.isIntersecting || entry.boundingClientRect.top < 0);
      },
      { rootMargin: '-35% 0px -35% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
        <Roles ref={studioRef} />
        <FeaturedWorks />
        {sections.map((s, i) => (
          <section
            key={i}
            style={sectionStyle}
            id={i === sections.length - 1 ? 'contact' : undefined}
          >
            <p style={eyebrowStyle}>{s.eyebrow}</p>
            <h2 style={titleStyle}>{s.title}</h2>
            <p style={bodyStyle}>
              Dummy section {i + 5}. Scroll to see the background morph and shift.
              Replace with real content once the motion feels right.
            </p>
          </section>
        ))}
      </main>
    </>
  );
}
