import { useEffect, useState } from "react";
import heroBackground from "../../assets/images/hungry-hour-hero.svg";
import SearchBar from "../common/SearchBar.jsx";

const popularSearches = ["Pizza", "Burgers", "Biryani", "Dosa"];

export default function Hero({ searchText, setSearchText }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setStage(4);
      return;
    }

    const t1 = window.setTimeout(() => setStage(1), 1500); // image reveal
    const t2 = window.setTimeout(() => setStage(2), 2200); // headline
    const t3 = window.setTimeout(() => setStage(3), 2900); // description
    const t4 = window.setTimeout(() => setStage(4), 3600); // search bar

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, []);

  return (
    <section
      className={`hero-section stage-${stage}`}
      aria-label="Featured food"
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className="hero-overlay" />
      <div className="hero-inner">
        <div className={`hero-copy copy-stage-${stage}`}>
          <p className="hero-eyebrow">
            <span aria-hidden="true">✦</span> EAT LIKE YOU MEAN IT
          </p>
          <h1 className={`hero-headline headline-stage-${stage}`}>
            <span className="hero-headline-wrap">
              <span className="hero-headline-line">Eat like you</span>
              <span className="hero-headline-line">mean it.</span>
            </span>
          </h1>
          <p className={`hero-description desc-stage-${stage}`}>
            Big cravings, little effort. Find the local favorites you love,
            delivered fresh to your door.
          </p>
          <div className={`hero-search-wrap search-stage-${stage}`}>
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Dishes, restaurants, cuisines..."
            />
            <a className="search-submit" href="#restaurants">
              Find food <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="popular-searches">
            <span>Popular:</span>
            {popularSearches.map((search) => (
              <button
                key={search}
                type="button"
                onClick={() => setSearchText(search)}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}