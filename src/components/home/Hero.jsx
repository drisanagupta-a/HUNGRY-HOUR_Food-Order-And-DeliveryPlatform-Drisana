import OpeningIntro from "../common/OpeningIntro.jsx";
import frame44Svg from "../../assets/images/frame44.svg";

export default function Hero() {
  return (
    <section className="dashboard-hero-banner" aria-label="Dashboard Hero">
      <OpeningIntro />
      <img
        src={frame44Svg}
        alt=""
        aria-hidden="true"
        className="dashboard-hero-banner-img"
        loading="eager"
        width="750"
        height="255"
      />
      <div className="dashboard-hero-content">
        <h1 className="dashboard-hero-headline">
          <span className="hero-headline-line">Order Your Favourite</span>
          <span className="hero-headline-line">Food Easily</span>
        </h1>
        <p className="dashboard-hero-description">
          Freshly cooked meals from your favorite local kitchens, delivered straight to your door with love.
        </p>
      </div>
    </section>
  );
}
