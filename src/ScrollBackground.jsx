import { useEffect, useRef } from 'react';
import './ScrollBackground.css';
import bgVideo from './assets/videos/bgvideo.mp4';

export default function ScrollBackground({ zoomed = false }) {
  const rootRef = useRef(null);
  const ticking = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.setProperty('--scroll-progress', progress.toFixed(4));
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(update);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`sb-root${zoomed ? ' sb-zoomed' : ''}`}
      aria-hidden="true"
    >
      <video
        className="sb-video"
        src={bgVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div className="sb-wash" />
      <div className="sb-tint" />
      <div className="sb-grain-coarse" />
      <div className="sb-grain" />
      <div className="sb-vignette" />
    </div>
  );
}
