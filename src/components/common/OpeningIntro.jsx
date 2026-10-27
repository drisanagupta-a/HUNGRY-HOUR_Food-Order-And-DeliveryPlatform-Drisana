import { useEffect, useState } from "react";

export default function OpeningIntro({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Show once per browser session
    const alreadyShown = sessionStorage.getItem("hh_opening_intro_shown");
    if (alreadyShown === "1") {
      setVisible(false);
      onComplete?.();
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const timer = window.setTimeout(() => {
      setRevealed(true);
    }, reducedMotion ? 50 : 80);

    const hideTimer = window.setTimeout(() => {
      sessionStorage.setItem("hh_opening_intro_shown", "1");
      setVisible(false);
      onComplete?.();
    }, reducedMotion ? 900 : 2200);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="opening-intro" aria-hidden="true">
      <div className="opening-inner">
        <div className={`opening-word ${revealed ? "opening-revealed" : ""}`}>
          <span className="opening-letter">C</span>
          <span className="opening-letter">R</span>
          <span className="opening-letter">A</span>
          <span className="opening-letter">V</span>
          <span className="opening-letter">I</span>
          <span className="opening-letter">N</span>
          <span className="opening-letter">G</span>
          <span className="opening-letter opening-dot">.</span>
          <span className="opening-letter opening-dot">.</span>
          <span className="opening-letter opening-dot">.</span>
        </div>
      </div>
    </div>
  );
}