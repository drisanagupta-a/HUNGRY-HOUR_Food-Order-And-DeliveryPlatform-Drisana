import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar.jsx";
import Sidebar from "../components/common/Sidebar.jsx";
import Footer from "../components/common/Footer.jsx";
import CategorySection from "../components/home/CategorySection.jsx";
import RestaurantCard from "../components/restaurant/RestaurantCard.jsx";
import { foodCategories, mockRestaurants } from "../data/mockRestaurants.js";
import {
  adaptRestaurant,
  extractArray,
  fetchRestaurants,
} from "../services/restaurantService.js";
import "../App.css";

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "rating-desc", label: "Rating: High to Low" },
  { value: "delivery-asc", label: "Delivery Time: Fastest First" },
];

function normalizeSearchText(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function includesSearchTerm(values, search) {
  if (!Array.isArray(values)) {
    return (
      typeof values === "string" && normalizeSearchText(values).includes(search)
    );
  }
  return values.some(
    (value) =>
      typeof value === "string" && normalizeSearchText(value).includes(search),
  );
}

function parseDeliveryMinutes(value) {
  if (typeof value !== "string") {
    return undefined;
  }
  const minutes = value.match(/\d+/);
  return minutes ? Number(minutes[0]) : undefined;
}

export default function Restaurants({
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

  // Live backend restaurants state
  const [backendRestaurants, setBackendRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const search = normalizeSearchText(searchText);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setApiError("");

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
        setApiError(
          error instanceof Error
            ? error.message
            : "Could not retrieve live restaurants from backend.",
        );
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
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

  // Filter restaurants by category, favorites, and search text
  const filteredRestaurants = activeRestaurants.filter((restaurant) => {
    // 1. Favorite filter
    if (showFavorites && !favorites.includes(restaurant.id)) {
      return false;
    }

    // 2. Category filter
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
              normalizeSearchText(restaurant.cuisine).includes("asian")));
      } else if (selectedCategory === "Drinks") {
        matchesCategory =
          (restaurant.categories &&
            (restaurant.categories.includes("Drinks") ||
              restaurant.categories.includes("Beverages"))) ||
          (restaurant.cuisine &&
            (normalizeSearchText(restaurant.cuisine).includes("beverage") ||
              normalizeSearchText(restaurant.cuisine).includes("drink") ||
              normalizeSearchText(restaurant.cuisine).includes("juice")));
      } else {
        matchesCategory =
          (restaurant.categories &&
            restaurant.categories.some((cat) =>
              normalizeSearchText(cat).includes(
                normalizeSearchText(selectedCategory),
              ),
            )) ||
          (restaurant.cuisine &&
            normalizeSearchText(restaurant.cuisine).includes(
              normalizeSearchText(selectedCategory),
            ));
      }
    }

    // 3. Search filter
    const matchesSearch =
      !search ||
      includesSearchTerm(
        [restaurant.name, restaurant.cuisine, ...(restaurant.categories ?? [])],
        search,
      );

    return matchesCategory && matchesSearch;
  });

  // Sort restaurants
  const restaurantSorters = {
    "rating-desc": (restaurant) =>
      restaurant.rating !== undefined
        ? Number.parseFloat(restaurant.rating)
        : 0,
    "delivery-asc": (restaurant) =>
      restaurant.time !== undefined
        ? parseDeliveryMinutes(restaurant.time)
        : 9999,
  };

  const sortedRestaurants =
    sortBy === "rating-desc"
      ? [...filteredRestaurants].sort(
          (a, b) =>
            (restaurantSorters["rating-desc"](b) || 0) -
            (restaurantSorters["rating-desc"](a) || 0),
        )
      : sortBy === "delivery-asc"
      ? [...filteredRestaurants].sort(
          (a, b) =>
            (restaurantSorters["delivery-asc"](a) || 9999) -
            (restaurantSorters["delivery-asc"](b) || 9999),
        )
      : filteredRestaurants;

  function toggleFavorite(restaurantId) {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(restaurantId)
        ? currentFavorites.filter((id) => id !== restaurantId)
        : [...currentFavorites, restaurantId],
    );
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
        onFavoritesClick={() => setShowFavorites((showing) => !showing)}
      />

      {/* Dashboard Layout: Left Sidebar + Main Content Area */}
      <div className="dashboard-layout-wrapper">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          activeSection="restaurants"
        />

        <main className="dashboard-main-content">
          {/* Header Section */}
          <div className="restaurants-page-header">
            <div className="flex items-center gap-2 mb-1">
              <span className="section-kicker">DISCOVER FOOD</span>
              {!hasBackendRestaurants && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f3eae0] text-[#746C61] border border-[#e4d6c5]">
                  Sample Catalog Fallback
                </span>
              )}
              {hasBackendRestaurants && !isLoading && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Backend
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#24211D] mb-1">
              {showFavorites ? "Favorite Restaurants" : "Restaurants"}
            </h1>
            <p className="text-sm md:text-base text-[#746C61]">
              {showFavorites
                ? "Here are the kitchens you’ve saved as your personal favorites."
                : "Explore top kitchens, verified chefs, and delicious cuisines near you."}
            </p>
            {apiError && !hasBackendRestaurants && (
              <p className="text-xs text-[#746C61] mt-2">
                Backend notice: {apiError}. Showing sample restaurants.
              </p>
            )}
          </div>

          {/* Food Category Icons */}
          <CategorySection
            categories={foodCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setShowFavorites(false);
            }}
          />

          {/* Results Toolbar / Sort */}
          <div
            className="results-toolbar"
            style={{ marginTop: "0", marginBottom: "28px" }}
          >
            <div className="results-counts" aria-live="polite">
              <strong>{sortedRestaurants.length}</strong>{" "}
              {sortedRestaurants.length === 1 ? "restaurant" : "restaurants"}{" "}
              available
              {selectedCategory !== "All" && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Category: <strong>{selectedCategory}</strong>
                  </span>
                </>
              )}
              {showFavorites && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#D90429] font-bold">
                    Favorites Only
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {(selectedCategory !== "All" || searchText || showFavorites) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-[#D90429] hover:underline font-semibold"
                >
                  Clear filters
                </button>
              )}
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
            </div>
          </div>

          {/* Restaurant Cards Grid */}
          {isLoading ? (
            <div className="empty-results" role="status">
              <span
                className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#D90429]/20 border-t-[#D90429] mb-3"
                aria-hidden="true"
              />
              <h3>Finding nearby kitchens...</h3>
              <p>Fetching approved restaurants from the backend.</p>
            </div>
          ) : sortedRestaurants.length > 0 ? (
            <div className="restaurant-grid">
              {sortedRestaurants.map((restaurant) => {
                const isFavorite = favorites.includes(restaurant.id);
                return (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isFavorite={isFavorite}
                    onToggleFavorite={toggleFavorite}
                    detailsBasePath={
                      previewEnabled
                        ? "/dev-dashboard-preview/restaurants"
                        : "/restaurants"
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="empty-results">
              <h3>No restaurants found</h3>
              <p>
                {showFavorites
                  ? "You have not saved any restaurants as favorites yet."
                  : "We couldn't find any restaurants matching your current criteria."}
              </p>
              <button
                type="button"
                className="clear-search-button mt-4"
                onClick={clearFilters}
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
