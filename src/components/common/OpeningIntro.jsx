import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function OpeningIntro({ onComplete }) {
  const location = useLocation();

  // Determine if Craving entrance should play:
  // After login/signup (pending flag or route state) or on initial session entry to dashboard
  const [isActive, setIsActive] = useState(() => {
    try {
      const isPending =
        sessionStorage.getItem("hh_craving_intro_pending") === "1" ||
        Boolean(location.state?.cravingIntro);
      const alreadyShown =
        sessionStorage.getItem("hh_opening_intro_shown") === "1";

      return isPending || !alreadyShown;
    } catch {
      return true;
    }
  });

  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Mark as shown so ordinary in-dashboard re-renders don't replay it
    try {
      sessionStorage.setItem("hh_opening_intro_shown", "1");
    } catch {
      // storage unavailable
    }

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      try {
        sessionStorage.removeItem("hh_craving_intro_pending");
      } catch {}
      const timer = window.setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, 200);
      return () => window.clearTimeout(timer);
    }

    // Step 1: Upward rise runs over 500ms.
    // Step 2: At 480ms, begin soft dissolve fade-out.
    const fadeTimer = window.setTimeout(() => {
      setFadingOut(true);
    }, 480);

    // Step 3: Complete transition and remove at 660ms (within 500–700ms range)
    const completeTimer = window.setTimeout(() => {
      try {
        sessionStorage.removeItem("hh_craving_intro_pending");
      } catch {}
      setIsActive(false);
      onComplete?.();
    }, 660);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div
      className={`opening-intro hero-craving-intro ${fadingOut ? "opening-fading-out" : ""}`}
      aria-hidden="true"
    >
      <div className="opening-inner">
        <span className="opening-word">Craving</span>
      </div>
    </div>
  );
}
