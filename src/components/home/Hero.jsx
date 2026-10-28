import { Link } from "react-router-dom";
import clothSvg from "../../assets/images/cloth.svg";
import bowlBreadSvg from "../../assets/images/bowlbread.svg";
import foodPlateImg from "../../assets/Mediterranean Sticker Food Collection 2.png";
import oliveBowlImg from "../../assets/Mediterranean Feast Sticker Set 2.png";
import orangeDrinkImg from "../../assets/Mediterranean Feast Sticker Set 5.png";
import oliveLeavesImg from "../../assets/Layer_1.png";
import lemonImg from "../../assets/Layer_1 (4).png";

export default function Hero() {
  return (
    <section className="figma-hero-section" aria-label="Special Offers">
      <div className="hero-banners-grid">
        {/* Large Yellow Promotional Banner (Left) */}
        <div className="hero-yellow-banner">
          {/* Promotional Text & Button on Left */}
          <div className="yellow-banner-content">
            <span className="banner-eyebrow-tag">SPECIAL PROMO</span>
            <h1 className="banner-main-headline">
              Order Your Favourite Food Easily
            </h1>
            <p className="banner-sub-description">
              Freshly cooked meals from your favorite local kitchens, delivered straight to your door with love.
            </p>
            <div className="banner-cta-wrap">
              <Link to="/restaurants" className="banner-order-button">
                Order Now <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Balanced Decorative Composition on Upper-Right */}
          <div className="yellow-banner-composition" aria-hidden="true">
            {/* Olive Leaves Accent at top edge */}
            <img
              src={oliveLeavesImg}
              alt=""
              className="comp-asset comp-olive-leaves"
            />

            {/* Checkered Cloth SVG in upper right */}
            <img
              src={clothSvg}
              alt=""
              className="comp-asset comp-cloth"
            />

            {/* Mediterranean Food Plate */}
            <img
              src={foodPlateImg}
              alt=""
              className="comp-asset comp-plate"
            />

            {/* Food Bowl / Pita Bread SVG extending at upper right */}
            <img
              src={bowlBreadSvg}
              alt="Mediterranean Food Bowl with Pita Bread"
              className="comp-asset comp-bowlbread"
            />

            {/* Olive Bowl decoration */}
            <img
              src={oliveBowlImg}
              alt=""
              className="comp-asset comp-olive-bowl"
            />

            {/* Orange Drink Asset */}
            <img
              src={orangeDrinkImg}
              alt="Fresh Orange Juice"
              className="comp-asset comp-orange-drink"
            />

            {/* Lemon Accent */}
            <img
              src={lemonImg}
              alt=""
              className="comp-asset comp-lemon"
            />
          </div>
        </div>

        {/* Small Pink Promotional Card (Right) */}
        <div className="hero-pink-card">
          <div className="pink-card-header">
            <span className="pink-eyebrow-tag">REFRESHING COMBO</span>
            <h2 className="pink-main-headline">
              Free Drinks With Meal
            </h2>
            <p className="pink-sub-description">
              On select restaurant orders above ₹299
            </p>
          </div>

          <div className="pink-card-visuals" aria-hidden="true">
            <img
              src={orangeDrinkImg}
              alt="Refreshing Orange Drink"
              className="pink-drink-img"
            />
            <img
              src={lemonImg}
              alt=""
              className="pink-lemon-img"
            />
          </div>

          <a href="#offers" className="pink-claim-button">
            Claim Offer <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
