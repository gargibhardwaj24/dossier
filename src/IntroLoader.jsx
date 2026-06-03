import './IntroLoader.css';
import sigRaw from './assets/signature.svg?raw';

// Give every path a normalized length of 1 so a single CSS keyframe can draw
// them all (stroke-dasharray/offset of 1 -> 0), no getTotalLength() needed.
const sigMarkup = sigRaw.replace(/<path /g, '<path pathLength="1" ');

export default function IntroLoader({ onComplete }) {
  return (
    <div
      className="intro-loader"
      aria-hidden="true"
      // The loader lifts itself via the `intro-lift` CSS animation; when that
      // (and only that) finishes, tell App to unmount us.
      onAnimationEnd={(e) => {
        if (e.animationName === 'intro-lift') onComplete?.();
      }}
      dangerouslySetInnerHTML={{ __html: `<div class="intro-sig">${sigMarkup}</div>` }}
    />
  );
}
