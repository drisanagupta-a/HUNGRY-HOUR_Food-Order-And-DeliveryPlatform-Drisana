import { useState } from "react";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import Hero from "../components/home/Hero.jsx";
import CategorySection from "../components/home/CategorySection.jsx";
import RestaurantSection from "../components/home/RestaurantSection.jsx";
import PopularDishes from "../components/home/PopularDishes.jsx";
import { foodCategories, mockDishes, mockRestaurants } from "../data/mockRestaurants.js";
import "../App.css";

const promotions = [
  {
    eyebrow: "A LITTLE EXTRA",
    title: "Free delivery,\nfirst bite's on us",
    detail: "On your first order over ₹299",
    code: "WELCOME",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85",
    tone: "coral",
  },
  {
    eyebrow: "MIDWEEK TREAT",
    title: "Good food.\nBetter prices.",
    detail: "Save up to ₹150 on select restaurants",
    code: "HAPPYHOUR",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=85",
    tone: "gold",
  },
  {
    eyebrow: "LUNCH PLANS?",
    title: "A feast for\none, please.",
    detail: "Curated lunch combos from ₹199",
    code: "LUNCHLOVE",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85",
    tone: "green",
  },
];

const deliverySteps = [
  {
    number: "01",
    icon: "⌕",
    title: "Discover restaurants",
    description: "Find neighborhood favorites and new flavors worth trying.",
  },
  {
    number: "02",
    icon: "♡",
    title: "Place your order",
    description: "Choose the dishes you love and add them to your basket.",
  },
  {
    number: "03",
    icon: "⌁",
    title: "Get your food delivered",
    description: "Settle in. A delicious meal is on its way to your door.",
  },
];

export default function Home({
  cartItems,
  onAddToCart,
  isDevelopmentPreview = false,
}) {
  const previewEnabled = import.meta.env.DEV && isDevelopmentPreview;
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const search = searchText.trim().toLowerCase();
  const matchingRestaurants = mockRestaurants.filter((restaurant) => {
    const matchesCategory =
      selectedCategory === "All" ||
      restaurant.categories.includes(selectedCategory);
    const matchesSearch =
      !search ||
      `${restaurant.name} ${restaurant.cuisine} ${restaurant.categories.join(" ")}`
        .toLowerCase()
        .includes(search);
    const matchesFavorites =
      !showFavorites || favorites.includes(restaurant.id);

    return matchesCategory && matchesSearch && matchesFavorites;
  });
  const matchingDishes = mockDishes.filter((dish) => {
    const matchesCategory =
      selectedCategory === "All" || dish.category === selectedCategory;
    const matchesSearch =
      !search ||
      `${dish.name} ${dish.restaurant} ${dish.category}`
        .toLowerCase()
        .includes(search);

    return matchesCategory && matchesSearch;
  });

  function toggleFavorite(restaurantId) {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(restaurantId)
        ? currentFavorites.filter((id) => id !== restaurantId)
        : [...currentFavorites, restaurantId],
    );
  }

  function selectCategory(category) {
    setSelectedCategory(category);
    setShowFavorites(false);
  }

  return (
    <div className="food-home" id="top">
      <Navbar
        searchText={searchText}
        setSearchText={setSearchText}
        favoriteCount={favorites.length}
        cartItems={cartItems}
        homePath={previewEnabled ? "/dev-dashboard-preview" : "/home"}
        showLogout={!previewEnabled}
        onFavoritesClick={() => {
          setShowFavorites((showingFavorites) => !showingFavorites);
          document.getElementById("restaurants")?.scrollIntoView({
            behavior: "smooth",
          });
        }}
      />

      <main>
        <Hero searchText={searchText} setSearchText={setSearchText} />

        <CategorySection
          categories={foodCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={selectCategory}
        />

        <section className="home-section offers-section" id="offers">
          <div className="section-heading">
            <div>
              <p className="section-kicker">GOOD THINGS ARE COOKING</p>
              <h2>Little offers, big joy.</h2>
            </div>
            <a className="text-link" href="#restaurants">
              Browse restaurants <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="offer-grid">
            {promotions.map((offer) => (
              <article
                className={`offer-card offer-card-${offer.tone}`}
                key={offer.code}
              >
                <img src={offer.image} alt="" loading="lazy" />
                <div className="offer-copy">
                  <p className="offer-eyebrow">{offer.eyebrow}</p>
                  <h3>
                    {offer.title.split("\n").map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h3>
                  <p className="offer-detail">{offer.detail}</p>
                  <a className="offer-button" href="#restaurants">
                    Find your feast <span aria-hidden="true">→</span>
                  </a>
                </div>
                <span className="offer-code">USE {offer.code}</span>
              </article>
            ))}
          </div>
        </section>

        <RestaurantSection
          restaurants={matchingRestaurants}
          favorites={favorites}
          showFavorites={showFavorites}
          detailsBasePath={
            previewEnabled
              ? "/dev-dashboard-preview/restaurants"
              : "/restaurants"
          }
          onToggleFavorite={toggleFavorite}
          onClearFilters={() => {
            setSearchText("");
            setSelectedCategory("All");
            setShowFavorites(false);
          }}
        />

        <PopularDishes
          dishes={matchingDishes}
          onAddToCart={onAddToCart}
          onClearFilters={() => {
            setSearchText("");
            setSelectedCategory("All");
          }}
        />

        <section className="how-section" id="help">
          <div className="home-section how-inner">
            <div className="section-heading how-heading">
              <div>
                <p className="section-kicker">GOOD FOOD, NO GUESSWORK</p>
                <h2>From craving to happy.</h2>
              </div>
              <p className="how-intro">
                Your next great meal is closer than you think. Here&apos;s how
                Hungry Hour makes it happen.
              </p>
            </div>
            <div className="steps-grid">
              {deliverySteps.map((step) => (
                <article className="step-card" key={step.number}>
                  <div className="step-topline">
                    <span className="step-icon" aria-hidden="true">
                      {step.icon}
                    </span>
                    <span className="step-number">{step.number}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
