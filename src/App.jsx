import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollBackground from './ScrollBackground';
import FixedVideoBg from './FixedVideoBg';
import HeroReveal from './HeroReveal';
import Hero from './Hero';
import FeaturedWorks from './FeaturedWorks';
import DiveIntro from './DiveIntro';
import Roles from './Roles';
import ScrollCurve from './ScrollCurve';
import Contact from './Contact';
import Footer from './Footer';
import IntroLoader from './IntroLoader';
import './IntroLoader.css';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const [showIntro, setShowIntro] = useState(!prefersReducedMotion);
  const [studioReached, setStudioReached] = useState(false);
  const studioRef = useRef(null);
  const lenisRef = useRef(null);
  const curveRegionRef = useRef(null);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
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
      // smooth-scroll in-page hash links (e.g. "Let's chat" → #contact) through
      // Lenis instead of letting the native jump fight it.
      anchors: true,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;
    lenis.scrollTo(0, { immediate: true });
    // Drive ScrollTrigger off Lenis' interpolated position so scrub-based
    // reveals (e.g. the footer wordmark) track the smooth scroll exactly.
    lenis.on('scroll', ScrollTrigger.update);
    let id = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    });
    ScrollTrigger.refresh();
    return () => {
      cancelAnimationFrame(id);
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = null;
    };
  }, [showIntro]);

  return (
    <>
      {showIntro && <IntroLoader onComplete={() => setShowIntro(false)} />}
      <ScrollBackground zoomed={studioReached} />
      <FixedVideoBg />
      <div className="reveal-bg" aria-hidden="true" />
      <main className="site-main" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-shift">
          <HeroReveal />
        </div>
        <DiveIntro />
        {/* Wrapper spans hero + roles so the scroll-drawn curve can pin to the
            combined region. ScrollCurve renders FIRST so its SVG paints behind
            the section text. */}
        <div className="curve-region" ref={curveRegionRef}>
          <ScrollCurve regionRef={curveRegionRef} />
          <Hero />
          <Roles ref={studioRef} />
        </div>
        <FeaturedWorks />
        <Contact />
      </main>
      {/* Footer lives OUTSIDE .site-main on purpose: .site-main carries the
          intro `page-rise` transform, and any transformed ancestor silently
          breaks `position: sticky` in its descendants. As a sibling of
          .site-main it has no transformed ancestor, so the footer's sticky
          pin resolves against the document scroll and stays glued to the
          bottom of the viewport. */}
      <Footer />
    </>
  );
}
