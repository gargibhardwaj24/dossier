import { forwardRef, useEffect, useRef, useState } from 'react';
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
  {
    seed: 'aurora',
    span: 'big',
    video: cursorVid,
    stillOffset: 1,
    name: 'humanOS',
    description: 'An AI-powered personal OS that helps people organize their goals, habits, focus, and personal growth in one unified experience.',
    link: 'https://human-os-two.vercel.app/',
    repo: 'https://github.com/gargibhardwaj24/humanOS',
  },
  {
    seed: 'procrastinator',
    span: 'half',
    photo: procrastinator,
    fit: 'contain',
    name: 'Procrastinator',
    description: 'Procrastinator is an app that helps people beat procrastination, stay focused, and get things done.',
    link: 'https://procrastinator-zeta.vercel.app/',
    repo: 'https://github.com/gargibhardwaj24/Procrastinator',
  },
  {
    seed: 'nanofacts',
    span: 'half',
    photo: nanofacts,
    name: 'NanoFactz',
    description: 'NanoFacts is a micro-learning platform that delivers short, engaging, and easy-to-digest facts, helping users learn something new in just a few seconds.',
    link: 'https://nanofacts.vercel.app/',
    repo: 'https://github.com/gargibhardwaj24/NanoFactz',
  },
  {
    seed: 'verde',
    span: 'big',
    video: hushMeet,
    name: 'HushMeet',
    description: 'HushMeet is an AI-powered communication tool that converts lip movements into real-time text and voice, making conversations, meetings, and communication accessible even in noisy environments',
    // link: '#',
    // repo: '#',
  },
  { seed: 'ember', span: 'big' },
];

function Slide({ seed, span, side = 'left', video, stillOffset = 0.5, photo, fit, name, description, link, repo, onExpand }) {
  // Bigger source for full-width slides, narrower for the 2-up row.
  const src =
    span === 'big'
      ? `https://picsum.photos/seed/${seed}/1600/900`
      : `https://picsum.photos/seed/${seed}/900/1000`;

  const videoRef = useRef(null);

  useEffect(() => {
    if (!video) return;
    const v = videoRef.current;
    if (!v) return;
    const showStill = () => {
      const end = Number.isFinite(v.duration) ? Math.max(0, v.duration - stillOffset) : 0;
      try {
        v.currentTime = end;
      } catch {
        /* metadata not ready yet */
      }
    };
    const onEnded = () => {
      v.pause();
      showStill();
    };
    v.addEventListener('loadedmetadata', showStill);
    v.addEventListener('ended', onEnded);
    if (v.readyState >= 1) showStill();
    return () => {
      v.removeEventListener('loadedmetadata', showStill);
      v.removeEventListener('ended', onEnded);
    };
  }, [video, stillOffset]);

  // Clicking a video opens it fullscreen and plays it with sound.
  const openVideo = (e) => {
    e.preventDefault();
    onExpand?.({ src: video, name });
  };

  return (
    <article
      className={`proj-slide proj-slide--${span} proj-slide--from-${side}${
        fit === 'contain' ? ' proj-slide--contain' : ''
      }`}
    >
      {video ? (
        <video
          ref={videoRef}
          src={video}
          muted
          playsInline
          preload="metadata"
          draggable="false"
          aria-label={name}
          className="proj-video"
          onClick={openVideo}
        />
      ) : (
        <img
          src={photo || src}
          alt={name || seed}
          loading="lazy"
          draggable="false"
        />
      )}

      <div className="proj-info">
        <span className="proj-line" aria-hidden="true" />
        <h3 className="proj-name">{name}</h3>
        <p className="proj-desc">{description}</p>
        <div className="proj-links">
          {link && (
            <a href={link} target="_blank" rel="noreferrer">
              Visit ↗
            </a>
          )}
          {repo && (
            <a href={repo} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

const FeaturedWorks = forwardRef(function FeaturedWorks(_props, ref) {
  const projectsRef = useRef(null);
  const [modal, setModal] = useState(null);

  // Lock scroll + close on Escape while the fullscreen video is open.
  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setModal(null);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [modal]);

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
    <section ref={ref} className="fw-section" id="projects" aria-label="Featured Works">
      <VariableFontText as="h2" className="fw-heading" text="Featured Works" />

      <div className="fw-projects" ref={projectsRef}>
        {/* 1 big slide */}
        <Slide {...PROJECTS[0]} side="left" onExpand={setModal} />

        {/* 2 slides adjacent, below it */}
        <div className="proj-row">
          <Slide {...PROJECTS[1]} side="left" onExpand={setModal} />
          <Slide {...PROJECTS[2]} side="right" onExpand={setModal} />
        </div>

        {/* then another 2 big slides */}
        <Slide {...PROJECTS[3]} side="right" onExpand={setModal} />
        {/* <Slide {...PROJECTS[4]} /> */}
      </div>

      {modal && (
        <div
          className="fw-modal"
          role="dialog"
          aria-modal="true"
          aria-label={modal.name}
          onClick={() => setModal(null)}
        >
          <button
            type="button"
            className="fw-modal-close"
            onClick={(e) => {
              e.stopPropagation();
              setModal(null);
            }}
            aria-label="Close video"
          >
            &times;
          </button>
          <video
            src={modal.src}
            autoPlay
            loop
            playsInline
            controls={false}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
});

export default FeaturedWorks;
