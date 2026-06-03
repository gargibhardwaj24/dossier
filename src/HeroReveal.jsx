import { useRef, useState, useCallback, useEffect } from 'react';
import jacketImg from './assets/jacket.jpg';
import heroImg from './assets/hero.jpg';
import './HeroReveal.css';


export default function HeroReveal() {
  const stageRef = useRef(null);
  const [active, setActive] = useState(false); // pointer is over the stage
  const [forced, setForced] = useState(false); // keyboard full reveal
  const [reduce, setReduce] = useState(false); // prefers-reduced-motion

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(m.matches);
    sync();
    m.addEventListener('change', sync);
    return () => m.removeEventListener('change', sync);
  }, []);

  const setPos = useCallback((clientX, clientY) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${clientX - rect.left}px`);
    el.style.setProperty('--my', `${clientY - rect.top}px`);
  }, []);

  const onMouseEnter = useCallback((e) => { setPos(e.clientX, e.clientY); setActive(true); }, [setPos]);
  const onMouseMove = useCallback((e) => setPos(e.clientX, e.clientY), [setPos]);
  const onMouseLeave = useCallback(() => setActive(false), []);

  const onTouchMove = useCallback((e) => {
    const t = e.touches[0];
    if (t) { setPos(t.clientX, t.clientY); setActive(true); }
  }, [setPos]);
  const onTouchEnd = useCallback(() => setActive(false), []);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setForced((f) => !f);
    }
  }, []);

  return (
    <section className="reveal-section" aria-label="Featured portrait">
      <button
        ref={stageRef}
        type="button"
        className={`reveal${active ? ' is-active' : ''}${forced ? ' is-forced' : ''}`}
        aria-pressed={forced}
        aria-label={forced ? 'Suit revealed — press to hide' : 'Move the pointer to reveal the suit, or press to reveal it fully'}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchMove}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onKeyDown={onKeyDown}
      >
        {/* default layer */}
        <img
          className="reveal-img reveal-base"
          src={jacketImg}
          alt="Portrait wearing a black jacket"
          draggable="false"
        />

        <img
          className="reveal-img reveal-top"
          src={heroImg}
          alt=""
          loading="lazy"
          draggable="false"
        />

        <svg className="reveal-shape" aria-hidden="true" focusable="false" preserveAspectRatio="none">
          <defs>
            <filter
              id="amoebaDistort"
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="turbulence"
                baseFrequency="0.013"
                numOctaves="2"
                seed="4"
                result="noise"
              >
                {!reduce && (
                  <animate
                    attributeName="baseFrequency"
                    dur="12s"
                    values="0.009;0.018;0.012;0.009"
                    repeatCount="indefinite"
                  />
                )}
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="60"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <mask id="revealMask">
              <g filter="url(#amoebaDistort)">
                <circle className="reveal-mask-shape" fill="#fff" />
              </g>
            </mask>
          </defs>

          {/* glowing jagged border = the same displaced circle, stroked */}
          <g className="reveal-edge-glow">
            <circle className="reveal-edge" filter="url(#amoebaDistort)" />
          </g>
        </svg>

        {/* scrims so the overlaid nav + scroll cue stay legible over the photo */}
        <span className="reveal-scrim reveal-scrim-top" aria-hidden="true" />
        <span className="reveal-scrim reveal-scrim-bottom" aria-hidden="true" />
      </button>
    </section>
  );
}
