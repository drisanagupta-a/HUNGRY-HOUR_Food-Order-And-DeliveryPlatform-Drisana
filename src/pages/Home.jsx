import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar.jsx";
import Sidebar from "../components/common/Sidebar.jsx";
import Footer from "../components/common/Footer.jsx";
import Hero from "../components/home/Hero.jsx";
import CategorySection from "../components/home/CategorySection.jsx";
import RestaurantSection from "../components/home/RestaurantSection.jsx";
import PopularDishes from "../components/home/PopularDishes.jsx";
import { foodCategories, mockDishes, mockRestaurants } from "../data/mockRestaurants.js";
import { adaptRestaurant, extractArray, fetchRestaurants } from "../services/restaurantService.js";
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

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Rating: High to Low" },
  { value: "delivery-asc", label: "Delivery Time: Fastest First" },
];

function normalizeSearchText(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function includesSearchTerm(values, search) {
  if (!Array.isArray(values)) {
    return typeof values === "string" && normalizeSearchText(values).includes(search);
  }
  return values.some(
    (value) =>
      typeof value === "string" &&
      normalizeSearchText(value).includes(search),
  );
}

function parseDeliveryMinutes(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const minutes = value.match(/\d+/);
  return minutes ? Number(minutes[0]) : undefined;
}

function sortByValue(items, getValue, direction = 1) {
  return [...items]
    .map((item, index) => ({ item, index, value: getValue(item) }))
    .sort((left, right) => {
      const leftMissing = !Number.isFinite(left.value);
      const rightMissing = !Number.isFinite(right.value);

      if (leftMissing && rightMissing) {
        return left.index - right.index;
      }
      if (leftMissing) {
        return 1;
      }
      if (rightMissing) {
        return -1;
      }

      return direction * (left.value - right.value) || left.index - right.index;
    })
    .map(({ item }) => item);
}

export default function Home({
  cartItems = [],
  onAddToCart,
  isDevelopmentPreview = false,
}) {
  const previewEnabled = import.meta.env.DEV && isDevelopmentPreview;
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("home");

  // Real backend restaurants state
  const [backendRestaurants, setBackendRestaurants] = useState([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [restaurantApiError, setRestaurantApiError] = useState("");

  const search = normalizeSearchText(searchText);

  useEffect(() => {
    let isCurrent = true;
    setIsLoadingRestaurants(true);
    setRestaurantApiError("");

    fetchRestaurants({ q: searchText.trim() || undefined })
      .then((data) => {
        if (!isCurrent) return;
        const list = extractArray(data);
        if (list.length > 0) {
          setBackendRestaurants(list.map(adaptRestaurant).filter(Boolean));
        } else {
          setBackendRestaurants([]);
        }
      })
      .catch((error) => {
        if (!isCurrent) return;
        setRestaurantApiError(
          error instanceof Error
            ? error.message
            : "Could not retrieve live restaurants from backend.",
        );
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingRestaurants(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [searchText]);

  const hasBackendRestaurants = backendRestaurants.length > 0;
  const activeRestaurants = hasBackendRestaurants
    ? backendRestaurants
    : mockRestaurants;

  const matchingDishes = mockDishes.filter((dish) => {
    const restaurant = activeRestaurants.find(
      (item) => item.id === dish.restaurantId,
    );
    let matchesCategory = selectedCategory === "All";
    if (!matchesCategory) {
      if (selectedCategory === "Noodles") {
        matchesCategory =
          includesSearchTerm(
            [dish.category, dish.name, ...(restaurant?.categories ?? []), restaurant?.cuisine],
            "noodle",
          ) ||
          includesSearchTerm(
            [dish.category, ...(restaurant?.categories ?? [])],
            "chinese",
          );
      } else if (selectedCategory === "Drinks") {
        matchesCategory =
          includesSearchTerm(
            [dish.category, dish.name, ...(restaurant?.categories ?? []), restaurant?.cuisine],
            "beverage",
          ) ||
          includesSearchTerm(
            [dish.category, ...(restaurant?.categories ?? [])],
            "drink",
          );
      } else {
        matchesCategory = includesSearchTerm(
          [dish.category, ...(restaurant?.categories ?? []), restaurant?.cuisine],
          normalizeSearchText(selectedCategory),
        );
      }
    }

    const matchesSearch =
      !search ||
      includesSearchTerm(
        [
          dish.name,
          dish.restaurant,
          dish.category,
          dish.description,
          restaurant?.name,
          restaurant?.cuisine,
          ...(restaurant?.categories ?? []),
        ],
        search,
      );

    return matchesCategory && matchesSearch;
  });

  const matchingRestaurants = activeRestaurants.filter((restaurant) => {
    const restaurantDishes = mockDishes.filter(
      (dish) => dish.restaurantId === restaurant.id,
    );
    let matchesCategory = selectedCategory === "All";
    if (!matchesCategory) {
      if (selectedCategory === "Noodles") {
        matchesCategory =
          (restaurant.categories &&
            (restaurant.categories.includes("Noodles") ||
              restaurant.categories.includes("Chinese"))) ||
          (restaurant.cuisine &&
            (normalizeSearchText(restaurant.cuisine).includes("noodle") ||
              normalizeSearchText(restaurant.cuisine).includes("chinese") ||
              normalizeSearchText(restaurant.cuisine).includes("asian"))) ||
          restaurantDishes.some(
            (d) =>
              d.category === "Noodles" ||
              normalizeSearchText(d.name).includes("noodle"),
          );
      } else if (selectedCategory === "Drinks") {
        matchesCategory =
          (restaurant.categories &&
            (restaurant.categories.includes("Drinks") ||
              restaurant.categories.includes("Beverages"))) ||
          (restaurant.cuisine &&
            (normalizeSearchText(restaurant.cuisine).includes("drink") ||
              normalizeSearchText(restaurant.cuisine).includes("beverage"))) ||
          restaurantDishes.some(
            (d) => d.category === "Drinks" || d.category === "Beverages",
          );
      } else {
        matchesCategory =
          (restaurant.categories &&
            restaurant.categories.includes(selectedCategory)) ||
          (restaurant.cuisine &&
            normalizeSearchText(restaurant.cuisine).includes(
              normalizeSearchText(selectedCategory),
            )) ||
          (restaurant.name &&
            normalizeSearchText(restaurant.name).includes(
              normalizeSearchText(selectedCategory),
            ));
      }
    }

    const searchFields = [
      restaurant.name,
      restaurant.cuisine,
      restaurant.address,
      ...(restaurant.categories || []),
      ...restaurantDishes.flatMap((dish) => [
        dish.name,
        dish.category,
        dish.description,
      ]),
    ].filter(Boolean);

    const matchesSearch = !search || includesSearchTerm(searchFields, search);
    const matchesFavorites =
      !showFavorites || favorites.includes(restaurant.id);

    return matchesCategory && matchesSearch && matchesFavorites;
  });

  const dishSorters = {
    "price-asc": (dish) => dish.price,
    "price-desc": (dish) => dish.price,
    "rating-desc": (dish) => Number.parseFloat(dish.rating),
    "delivery-asc": (dish) => {
      const restaurant = activeRestaurants.find(
        (item) => item.id === dish.restaurantId,
      );
      return parseDeliveryMinutes(restaurant?.time);
    },
  };

  const restaurantSorters = {
    "price-asc": (restaurant) => {
      const prices = mockDishes
        .filter((dish) => dish.restaurantId === restaurant.id)
        .map((dish) => dish.price)
        .filter((price) => Number.isFinite(price));
      return prices.length ? Math.min(...prices) : undefined;
    },
    "price-desc": (restaurant) => {
      const prices = mockDishes
        .filter((dish) => dish.restaurantId === restaurant.id)
        .map((dish) => dish.price)
        .filter((price) => Number.isFinite(price));
      return prices.length ? Math.min(...prices) : undefined;
    },
    "rating-desc": (restaurant) =>
      restaurant.rating !== undefined
        ? Number.parseFloat(restaurant.rating)
        : 0,
    "delivery-asc": (restaurant) =>
      restaurant.time !== undefined
        ? parseDeliveryMinutes(restaurant.time)
        : 9999,
  };

  const sortDirection = sortBy === "price-desc" ? -1 : 1;
  const sortedDishes = dishSorters[sortBy]
    ? sortByValue(matchingDishes, dishSorters[sortBy], sortDirection)
    : matchingDishes;
  const sortedRestaurants = restaurantSorters[sortBy]
    ? sortByValue(
        matchingRestaurants,
        restaurantSorters[sortBy],
        sortDirection,
      )
    : matchingRestaurants;

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

  function clearFilters() {
    setSearchText("");
    setSelectedCategory("All");
    setSortBy("recommended");
    setShowFavorites(false);
  }

  return (
    <div className="food-home" id="top">
      {/* 1. Top Navbar */}
      <Navbar
        searchText={searchText}
        setSearchText={setSearchText}
        favoriteCount={favorites.length}
        cartItems={cartItems}
        homePath={previewEnabled ? "/dev-dashboard-preview" : "/home"}
        showLogout={!previewEnabled}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        onFavoritesClick={() => {
          setShowFavorites((showingFavorites) => !showingFavorites);
          document.getElementById("restaurants")?.scrollIntoView({
            behavior: "smooth",
          });
        }}
      />

      {/* Dashboard Layout: Left Sidebar + Main Content Area */}
      <div className="dashboard-layout-wrapper">
        {/* 2. Left Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        {/* Main Content Area */}
        <main className="dashboard-main-content">
          {/* 3. Main Hero Section */}
          <Hero />

          {/* 4. Food Categories (immediately below hero) */}
          <CategorySection
            categories={foodCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={selectCategory}
          />

          {/* 5. Top Restaurants Section (immediately below categories) */}
          <RestaurantSection
            restaurants={sortedRestaurants}
            favorites={favorites}
            showFavorites={showFavorites}
            detailsBasePath={
              previewEnabled
                ? "/dev-dashboard-preview/restaurants"
                : "/restaurants"
            }
            onToggleFavorite={toggleFavorite}
            onClearFilters={clearFilters}
            isLoading={isLoadingRestaurants}
            isFallback={!hasBackendRestaurants}
            apiError={restaurantApiError}
          />

          {/* Filter Toolbar / Counts */}
          <section
            className="home-section results-toolbar"
            aria-label="Search results and sorting"
          >
            <div className="results-counts" aria-live="polite">
              <strong>{sortedRestaurants.length}</strong>{" "}
              {sortedRestaurants.length === 1 ? "restaurant" : "restaurants"}
              <span aria-hidden="true">·</span>
              <strong>{sortedDishes.length}</strong>{" "}
              {sortedDishes.length === 1 ? "dish" : "dishes"}
            </div>
            <label className="sort-control">
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {/* Offers Section */}
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

          {/* Popular Dishes */}
          <PopularDishes
            dishes={sortedDishes}
            onAddToCart={onAddToCart}
            onClearFilters={clearFilters}
          />

          {/* How Hungry Hour Works */}
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
      </div>

      <Footer />
    </div>
  );
}
