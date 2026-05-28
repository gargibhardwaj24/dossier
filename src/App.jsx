import ScrollBackground from './ScrollBackground';
import FixedVideoBg from './FixedVideoBg';
import Hero from './Hero';
import DiveIntro from './DiveIntro';

const sections = [
  { eyebrow: '03 — STUDIO',  title: 'made in motion' },
  { eyebrow: '04 — PROCESS', title: 'curious by default' },
  { eyebrow: '05 — CLIENTS', title: 'people we love' },
  { eyebrow: '06 — CONTACT', title: 'say hello' },
];

const sectionStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '0 6vw',
  position: 'relative',
  color: '#efe9d8',
};

const eyebrowStyle = {
  fontFamily: 'Archivo, system-ui, sans-serif',
  fontSize: 13,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  opacity: 0.7,
  margin: 0,
};

const titleStyle = {
  fontFamily: 'Instrument Serif, Georgia, serif',
  fontStyle: 'italic',
  fontWeight: 400,
  fontSize: 'clamp(48px, 9vw, 140px)',
  lineHeight: 1.02,
  letterSpacing: '-0.02em',
  margin: '24px 0 0',
};

const bodyStyle = {
  maxWidth: 520,
  marginTop: 28,
  opacity: 0.75,
  fontSize: 17,
  lineHeight: 1.55,
};

export default function App() {
  return (
    <>
      <ScrollBackground />
      <FixedVideoBg />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <DiveIntro />
        {sections.map((s, i) => (
          <section key={i} style={sectionStyle} id={i === sections.length - 1 ? 'contact' : undefined}>
            <p style={eyebrowStyle}>{s.eyebrow}</p>
            <h2 style={titleStyle}>{s.title}</h2>
            <p style={bodyStyle}>
              Dummy section {i + 3}. Scroll to see the background morph and shift.
              Replace with real content once the motion feels right.
            </p>
          </section>
        ))}
      </main>
    </>
  );
}
