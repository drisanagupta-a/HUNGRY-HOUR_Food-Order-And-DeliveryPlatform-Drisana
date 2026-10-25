import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import hungryHourLogo from "../assets/Group 9.svg";
import {
  checkConfiguredPublicEndpoint,
  hasConfiguredPublicHealthPath,
} from "../services/authService.js";
import "./Intro.css";

const introStages = [
  "WAKING UP OUR KITCHEN...",
  "GETTING THINGS READY...",
  "READY FOR HAPPY HOUR!",
];

export default function Intro({ onComplete }) {
  const [stage, setStage] = useState(0);
  const [backendNote, setBackendNote] = useState("");
  const healthRequestStarted = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;
    if (!healthRequestStarted.current) {
      healthRequestStarted.current = true;
      const healthRequest = checkConfiguredPublicEndpoint();

      if (healthRequest) {
        healthRequest.catch((error) => {
          console.warn("The intro backend check did not succeed.", error);
          if (isCurrent) {
            setBackendNote("Backend check unavailable. Sign-in will continue.");
          }
        });
      }
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const stageTimings = reducedMotion ? [350, 800] : [2_800, 5_700];
    const redirectDelay = reducedMotion ? 1_250 : 6_000;
    const timers = [
      ...stageTimings.map((delay, index) =>
        window.setTimeout(() => setStage(index + 1), delay),
      ),
      window.setTimeout(
        () => {
          onComplete?.();
          navigate("/login", { replace: true });
        },
        redirectDelay,
      ),
    ];

    return () => {
      isCurrent = false;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [navigate, onComplete]);

  return (
    <main className="intro-screen">
      <div className="intro-orbit intro-orbit-one" aria-hidden="true" />
      <div className="intro-orbit intro-orbit-two" aria-hidden="true" />

      <section className="intro-content" aria-labelledby="intro-title">
        <img
          className="intro-brand-logo"
          src={hungryHourLogo}
          alt="HUNGRY HOUR"
          id="intro-title"
        />
        <p className="intro-eyebrow">GOOD FOOD, GOOD MOOD</p>

        <div className="intro-burger-stage" aria-hidden="true">
          <div className="intro-burger-plate" />
          <div className="intro-burger">
            <span className="intro-burger-part intro-bottom-bun" />
            <span className="intro-burger-part intro-patty" />
            <span className="intro-burger-part intro-cheese" />
            <span className="intro-burger-part intro-tomatoes">
              <i className="intro-tomato-slice intro-tomato-left" />
              <i className="intro-tomato-slice intro-tomato-right" />
            </span>
            <span className="intro-burger-part intro-lettuce" />
            <span className="intro-burger-part intro-top-bun">
              <i className="intro-sesame sesame-a" />
              <i className="intro-sesame sesame-b" />
              <i className="intro-sesame sesame-c" />
              <i className="intro-sesame sesame-d" />
              <i className="intro-sesame sesame-e" />
              <i className="intro-sesame sesame-f" />
              <i className="intro-sesame sesame-g" />
            </span>
          </div>
        </div>

        <p className="intro-message" role="status" aria-live="polite">
          {introStages[stage]}
        </p>
        <p className="intro-caption">A LITTLE JOY IS ON ITS WAY</p>
        <p className="intro-backend-note" aria-live="polite">
          {backendNote ||
            (!hasConfiguredPublicHealthPath
              ? "Backend wake-up check needs a confirmed public endpoint."
              : "")}
        </p>
        <div className="intro-progress" aria-hidden="true">
          <span />
        </div>
      </section>
      <span className="intro-side-note" aria-hidden="true">
        FRESHLY MADE · ALWAYS CRAVEABLE
      </span>
    </main>
  );
}
