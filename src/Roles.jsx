import { forwardRef, useRef, useState } from 'react';
import cursorVid from './assets/creative.mp4';
import './Roles.css';

const roles = [
  'Design Engineer',
  'Product Designer',
  'Full-Stack Developer',
  'AI Product Developer',
];
 
const Roles = forwardRef(function Roles(_props, ref) { 
  const cursorRef = useRef(null);
  const sectionRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  const setRefs = (node) => {
    sectionRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const handleMove = (e) => {
    const el = cursorRef.current;
    const section = sectionRef.current;
    if (!el || !section) return;
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top; 
    el.style.transform = `translate(${x}px, ${y}px) translate(18px, 24px)`;
  };

  return (
    <section className="roles-section" id="roles" ref={setRefs}>
      <p className="roles-eyebrow">04 — ROLES</p>
      <ul
        className="roles-list"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={handleMove}
      >
        {roles.map((role) => (
          <li key={role} className="roles-item" tabIndex={0}>
            {role}
          </li>
        ))}
      </ul>

      <video
        ref={cursorRef}
        className={`roles-cursor-vid${hovering ? ' is-visible' : ''}`}
        src={cursorVid}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
    </section>
  );
});

export default Roles;
