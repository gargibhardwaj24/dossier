import { useEffect, useRef, useState } from 'react';
import heroVdo from './assets/videos/hero_vdo.mp4';
import './FixedVideoBg.css';


export default function FixedVideoBg() {
  const [active, setActive] = useState(false);
  const rafRef = useRef(0);
  const videoRef = useRef(null);

  // When this full-screen video takes over the journey, align it to the dive
  // video's playhead so the crossfade reads as one continuous clip, not two.
  useEffect(() => {
    if (!active) return;
    const fvb = videoRef.current;
    const dive = document.querySelector('.dive-video');
    if (fvb && dive) {
      try { fvb.currentTime = dive.currentTime; } catch { /* not ready yet */ }
    }
  }, [active]);

  useEffect(() => {
    const update = () => {
      const section = document.querySelector('.dive-section');
      if (section) {
        const progress =
          parseFloat(
            getComputedStyle(section).getPropertyValue('--dive-progress')
          ) || 0;
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        // The journey video lives and dies with the dive section: it deactivates
        // the moment the section's bottom reaches the viewport — i.e. as the
        // "through THIS JOURNEY WITH ME" text scrolls away — so the two leave
        // together rather than the video lingering into the next page.
        const sectionStillVisible = rect.bottom > vh;
        setActive(progress > 0.06 && sectionStillVisible);
      }
      rafRef.current = 0;
    };
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className={`fvb-root${active ? ' is-active' : ''}`} aria-hidden="true">
      <video
        ref={videoRef}
        className="fvb-video"
        src={heroVdo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div className="fvb-grad" />
    </div>
  );
}
