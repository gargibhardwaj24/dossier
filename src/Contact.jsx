import { useEffect, useRef } from 'react';
import './Contact.css';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const EMAIL = 'hello@gargibhardwaj.com';

const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { label: 'GitHub', href: 'https://github.com/' },
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'Twitter', href: 'https://twitter.com/' },
];

export default function Contact() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll('[data-reveal]'));

    if (prefersReducedMotion) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.classList.toggle('is-in', e.isIntersecting);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="contact-section" id="contact" ref={sectionRef} aria-label="Contact">
      <p className="contact-eyebrow" data-reveal></p>

      <h2 className="contact-heading" data-reveal>
        Let&rsquo;s build
        <br />
        something good.
      </h2>

      <a className="contact-email" href={`mailto:${EMAIL}`} data-reveal>
        {EMAIL}
      </a>

      <ul className="contact-socials" data-reveal>
        {SOCIALS.map((s) => (
          <li key={s.label}>
            <a href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
