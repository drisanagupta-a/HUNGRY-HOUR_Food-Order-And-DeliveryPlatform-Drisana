import OpeningIntro from "../common/OpeningIntro.jsx";
import frame44Svg from "../../assets/images/frame44.svg";

export default function Hero() {
  return (
    <section className="dashboard-hero-banner" aria-label="Dashboard Hero">
      <OpeningIntro />
      <img
        src={frame44Svg}
        alt="HUNGRY HOUR promotional food hero banner"
        className="dashboard-hero-banner-img"
        loading="eager"
        width="750"
        height="255"
      />
    </section>
  );
}
