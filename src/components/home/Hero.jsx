import oliveBowl from "../../assets/Mediterranean Feast Sticker Set 2.png";
import lemon from "../../assets/Layer_1 (4).png";
import SearchBar from "../common/SearchBar.jsx";

const popularSearches = ["Pizza", "Burgers", "Biryani", "Dosa"];

export default function Hero({ searchText, setSearchText }) {
  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span aria-hidden="true">✦</span> A LITTLE HAPPINESS, DELIVERED
          </p>
          <h1>
            Good food.
            <br />
            <span>Good mood.</span>
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
          <div className="hero-trust">
            <span className="trust-avatars" aria-hidden="true">
              <i>☺</i>
              <i>☺</i>
              <i>☺</i>
            </span>
            <span>
              <b>Made for your kind of hungry</b>
              <small>Local favorites, always close by</small>
            </span>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-photo-frame">
            <img
              className="hero-photo"
              src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=90"
              alt="A colorful table of fresh, delicious food"
              fetchPriority="high"
            />
            <div className="hero-photo-shade" />
            <div className="hero-photo-caption">
              <span className="caption-stars">★★★★★</span>
              <span>Something lovely is cooking</span>
            </div>
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
          <div className="hero-float-card">
            <span className="float-card-icon" aria-hidden="true">
              ↗
            </span>
            <span>
              <b>Made with care</b>
              <small>From kitchens near you</small>
            </span>
          </div>
        </div>
      </div>
      <div className="hero-bottom-note">
        <span>Good things take a little time</span>
        <span className="note-line" />
        <span>Great food is worth it</span>
      </div>
    </section>
  );
}