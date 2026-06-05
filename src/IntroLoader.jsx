import './IntroLoader.css';
import sigRaw from './assets/signature.svg?raw';
const sigMarkup = sigRaw.replace(/<path /g, '<path pathLength="1" ');

export default function IntroLoader({ onComplete }) {
  return (
    <div
      className="intro-loader"
      aria-hidden="true" 
      onAnimationEnd={(e) => {
        if (e.animationName === 'intro-lift') onComplete?.();
      }}
      dangerouslySetInnerHTML={{ __html: `<div class="intro-sig">${sigMarkup}</div>` }}
    />
  );
}
