import { useEffect, useState } from "react";
import foodHero from "../../assets/Mediterranean Sticker Food Collection 2.png";
import oliveBowl from "../../assets/Mediterranean Feast Sticker Set 2.png";
import lemon from "../../assets/Layer_1 (4).png";
import SearchBar from "../common/SearchBar.jsx";

const popularSearches = ["Pizza", "Burgers", "Biryani", "Dosa"];

export default function Hero({ searchText, setSearchText }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="hero-section" aria-label="Featured food">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span aria-hidden="true">✦</span> EAT LIKE YOU MEAN IT
          </p>
          <h1 className={`hero-headline ${revealed ? "hero-revealed" : ""}`}>
            <span className="hero-headline-wrap">
              <span className={`hero-headline-line ${revealed ? "hero-revealed" : ""}`}>
                Eat like you
              </span>
              <span className={`hero-headline-line ${revealed ? "hero-revealed" : ""}`}>
                mean it.
              </span>
            </span>
          </h1>
          <p className="hero-description">
            Big cravings, little effort. Find the local favorites you love,
            delivered fresh to your door.
          </p>
          <div className="hero-search-wrap">
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

        <div className="hero-art">
          <div className="hero-photo-frame">
            <img
              className="hero-photo"
              src={foodHero}
              alt="A colorful spread of fresh, delicious dishes"
              fetchPriority="high"
            />
            <div className="hero-photo-shade" />
          </div>
          <img
            className="hero-sticker hero-olive"
            src={oliveBowl}
            alt=""
            aria-hidden="true"
          />
          <img
            className="hero-sticker hero-lemon"
            src={lemon}
            alt=""
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}