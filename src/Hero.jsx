import { useEffect, useRef, useState } from 'react';
import heroVdo from './assets/videos/hero_vdo.mp4';
import './Hero.css';

const ROTATING_WORDS = ['PRESENCE', 'DESIGN', 'IDEAS', 'SYSTEMS', 'VISION'];
const ROTATE_MS = 2500;

const MENU_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'Roles', href: '#roles' },
  { label: 'Projects', href: '#projects' },
];

export default function Hero() {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [atBottom, setAtBottom] = useState(false);
  const [cueHidden, setCueHidden] = useState(false);
  const inlineRef = useRef(null);
  const modalRef = useRef(null);
  const heroSectionRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  // progressive blur on scroll: 0 at top (sharp) → 1 after one viewport (blurred)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight || 1;
      const docH = document.documentElement.scrollHeight;
      const maxScroll = Math.max(1, docH - vh);

      const heroEl = heroSectionRef.current;
      const heroTop = heroEl
        ? heroEl.getBoundingClientRect().top + window.scrollY
        : 0;
      const t = Math.min(1, Math.max(0, (window.scrollY - heroTop) / (vh * 0.6)));
      document.documentElement.style.setProperty('--hero-blur', t.toFixed(4));

      const firstPage = document.querySelector('.reveal-section');
      const scrolledPastFirst = firstPage
        ? -firstPage.getBoundingClientRect().top
        : window.scrollY;
      setCueHidden(scrolledPastFirst > vh * 0.6);

      // total page progress, used for the bottom-of-page cue flip
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      document.documentElement.style.setProperty('--page-progress', p.toFixed(4));
      setAtBottom(p > 0.92);

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
  }, []);

  // sync modal with inline playhead and (un)mute
  useEffect(() => {
    const inline = inlineRef.current;
    const modal = modalRef.current;
    if (!inline) return;
    if (expanded && modal) {
      try {
        modal.currentTime = inline.currentTime;
      } catch {}
      modal.muted = false;
      modal.volume = 1;
      modal.play().catch(() => {});
    }
    inline.muted = true;
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  const handleMenuNav = (href) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    const id = href.replace('#', '');

    const scrollToY = (y) => {
      const lenis = window.__lenis;
      if (lenis) lenis.scrollTo(y, { duration: 1.2 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    };

    // wait for the close transition to start, then go to the section
    setTimeout(() => {
      if (id === 'top') {
        scrollToY(0);
        return;
      }

      // The contact section is pinned and its panel only fades in partway
      // through a +=130% scrub. Scrolling to the panel's DOM position lands
      // on it while still invisible — instead aim near the end of the pin so
      // the reveal has played and the panel is fully visible.
      if (id === 'contact') {
        const wrap = document.querySelector('.contact-blob-wrap');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (wrap) {
          const start = wrap.getBoundingClientRect().top + window.scrollY;
          const y = reduce ? start : start + window.innerHeight * 1.3 * 0.95;
          scrollToY(y);
          return;
        }
      }

      const target = document.getElementById(id);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY;
        scrollToY(y);
      }
    }, 120);
  };

  return (
    <>
      <header className="site-nav">
        <button
          className="nav-btn nav-menu"
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true">
            <line x1="0" y1="2"  x2="22" y2="2"  stroke="currentColor" strokeWidth="1.4" />
            <line x1="0" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span>Menu</span>
        </button>

        <a href="#top" className="nav-logo">
          <span className="logo-from">Gargi</span>
          <span className="logo-another">Bhardwaj</span>
        </a>

        <div className="nav-right">
          <a href="#contact" className="nav-btn nav-chat" onClick={handleMenuNav('#contact')}>
            <span>Let&rsquo;s chat</span>
            <span className="nav-arrow" aria-hidden="true">&rarr;</span>
          </a>
          {/* <div className="hero-lang mt-4" aria-label="Disciplines">
            <span>UI</span>
            <span className="hero-lang-sep">|</span>
            <span>DEV</span>
            <span className="hero-lang-sep">|</span>
            <span>UX</span>
            <span className="hero-lang-sep">|</span>
            <span>AI</span>
          </div> */}
        </div>
      </header>

      <section className="hero" id="top" ref={heroSectionRef}>
        {/* <p className="hero-since">Since 2020</p> */}

        <h1 className="hero-headline">
          NOT JUST<br />
          WEBSITES &mdash; <span className="curve-anchor">I</span><br />
          BUILD{' '}
          <button
            type="button"
            className="hero-vid-btn"
            onClick={() => setExpanded(true)}
            aria-label="Play showreel with sound"
          >
            <video
              ref={inlineRef}
              src={heroVdo}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </button>
          <br />
          <span key={wordIndex} className="hero-rotating-word">
            {ROTATING_WORDS[wordIndex]}
          </span>
        </h1>

      </section>

      <button
        type="button"
        className={`hero-scroll-cue${atBottom ? ' is-at-bottom' : ''}${cueHidden ? ' is-hidden' : ''}`}
        onClick={() => {
          if (atBottom) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
          }
        }}
        aria-label={atBottom ? 'Back to top' : 'Scroll down'}
      >
        <span className="cue-dot" />
        <span className="cue-line" />
      </button>

      <div
        className={`menu-overlay${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="menu-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
        >
          <span>Close</span>
          <span className="menu-close-x" aria-hidden="true">&times;</span>
        </button>

        <nav className="menu-nav" aria-label="Primary">
          <ul>
            {MENU_LINKS.map((link, i) => (
              <li key={link.href} style={{ '--menu-i': i }}>
                <a
                  href={link.href}
                  className="menu-link"
                  onClick={handleMenuNav(link.href)}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="menu-contact" style={{ '--menu-i': MENU_LINKS.length }}>
          <a
            href="#contact"
            className="menu-contact-label"
            onClick={handleMenuNav('#contact')}
            tabIndex={menuOpen ? 0 : -1}
          >
            Reach out to me
          </a>
          <a
            href="mailto:gargibhardwaj2430@gmail.com"
            className="menu-contact-email"
            tabIndex={menuOpen ? 0 : -1}
          >
            gargibhardwaj2430@gmail.com
          </a>
        </div>
      </div>

      {expanded && (
        <div
          className="hero-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setExpanded(false)}
        >
          <button
            type="button"
            className="hero-modal-close"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
            aria-label="Close video"
          >
            &times;
          </button>
          <video
            ref={modalRef}
            src={heroVdo}
            autoPlay
            loop
            playsInline
            controls={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
