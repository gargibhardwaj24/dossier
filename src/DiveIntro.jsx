import { useEffect, useRef, useState } from 'react';
import heroVdo from './assets/videos/hero_vdo.mp4';
import './DiveIntro.css';


const DEBUG = true;

export default function DiveIntro() {
  const sectionRef = useRef(null);
  const textGroupRef = useRef(null);

  const [focal, setFocal] = useState({ x: 720, y: 465 });

  useEffect(() => {
    if (!DEBUG) return;
    const onKey = (e) => {
      const step = e.shiftKey ? 1 : 5;
      setFocal((f) => {
        let { x, y } = f;
        if (e.key === 'ArrowLeft')  x -= step;
        if (e.key === 'ArrowRight') x += step;
        if (e.key === 'ArrowUp')    y -= step;
        if (e.key === 'ArrowDown')  y += step;
        if (e.key === 'l' || e.key === 'L') {
          // eslint-disable-next-line no-console
          console.log(`FOCAL locked: x=${x} y=${y}`);
        }
        return { x, y };
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const textGroup = textGroupRef.current;
    if (!section || !textGroup) return;

    const FOCAL_X = focal.x;
    const FOCAL_Y = focal.y;

    let raf = 0;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = Math.max(1, section.offsetHeight - vh);
      const scrolled = Math.max(0, Math.min(scrollable, -rect.top));
      const t = scrolled / scrollable;

      const zoomRaw = Math.max(0, Math.min(1, (t - 0.04) / 0.14));
      const zoomEased = Math.pow(zoomRaw, 1.9);
      const scale = 1 + zoomEased * 200;

      textGroup.setAttribute(
        'transform',
        `translate(${FOCAL_X} ${FOCAL_Y}) scale(${scale.toFixed(3)}) translate(${-FOCAL_X} ${-FOCAL_Y})`
      );

      section.style.setProperty('--dive-progress', t.toFixed(4));
      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [focal]);

  return (
    <section ref={sectionRef} className="dive-section" id="work">
      <div className="dive-sticky">
        <div className="dive-masked">
          <video
            className="dive-video"
            src={heroVdo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
          <div className="dive-blur-grad" />
          <div className="dive-noise" />
        </div>

        <svg
          className="dive-cover-svg"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <mask
              id="dive-text-mask"
              maskUnits="userSpaceOnUse"
              x="-50000"
              y="-50000"
              width="100000"
              height="100000"
            >
              <rect
                x="-50000"
                y="-50000"
                width="100000"
                height="100000"
                fill="black"
              />
              <g ref={textGroupRef}>
                <text
                  x="800"
                  y="465"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Archivo, system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="280"
                  letterSpacing="-6"
                  fill="white"
                >
                  DIVE IN
                </text>
              </g>
            </mask>
          </defs>

          {/* {DEBUG && (
            <g style={{ pointerEvents: 'none' }}>
              <circle
                cx={focal.x}
                cy={focal.y}
                r="6"
                fill="red"
                stroke="white"
                strokeWidth="2"
              />
              <rect x="10" y="14" width="540" height="34" fill="rgba(0,0,0,0.6)" />
              <text
                x="20"
                y="38"
                fill="lime"
                fontFamily="monospace"
                fontSize="18"
              >
                focal: {focal.x}, {focal.y}  —  arrows nudge, Shift=fine, L=log
              </text>
            </g>
          )} */}
        </svg>

        <div className="dive-journey-content">
          <h2 className="dive-journey-title">
            <span className="dive-journey-title-span">through</span>  THIS<br />JOURNEY WITH ME
          </h2>
        </div>
      </div>
    </section>
  );
}
