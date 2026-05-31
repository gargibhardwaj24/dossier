import { useRef, useState, useCallback } from 'react';
import jacketImg from './assets/jacket.jpg';
import heroImg from './assets/hero.jpg';
import './HeroReveal.css';

/**
 * Spotlight reveal — jacket.jpg shows everywhere; hero.jpg is masked to a
 * soft circle that follows the cursor (or finger), so only the area around
 * the pointer "transforms".
 *
 * Both images are pre-aligned to the same 16:9 frame and stacked absolutely
 * at identical size (object-fit: cover, no scaling), so the face stays locked
 * across the swap.
 */
export default function HeroReveal() {
  const stageRef = useRef(null);
  const [active, setActive] = useState(false); // pointer is over the stage
  const [forced, setForced] = useState(false); // keyboard full reveal

  // write the pointer position straight to CSS vars (no re-render per move)
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

  // keyboard users can't aim a spotlight — Enter/Space reveals the whole image
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
        {/* revealed layer — lazy loaded, masked to a circle around the pointer */}
        <img
          className="reveal-img reveal-top"
          src={heroImg}
          alt="The same portrait transformed into a superhero suit"
          loading="lazy"
          draggable="false"
        />

        {/* white ring tracing the spotlight boundary */}
        <span className="reveal-ring" aria-hidden="true" />

        {/* scrims so the overlaid nav + scroll cue stay legible over the photo */}
        <span className="reveal-scrim reveal-scrim-top" aria-hidden="true" />
        <span className="reveal-scrim reveal-scrim-bottom" aria-hidden="true" />

        
      </button>
    </section>
  );
}
