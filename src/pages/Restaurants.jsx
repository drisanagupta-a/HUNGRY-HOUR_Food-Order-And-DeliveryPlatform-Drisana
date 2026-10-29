import { useEffect, useState } from "react";
import { AlertCircle, UtensilsCrossed } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Sidebar from "../components/common/Sidebar.jsx";
import Footer from "../components/common/Footer.jsx";
import CategorySection from "../components/home/CategorySection.jsx";
import RestaurantCard from "../components/restaurant/RestaurantCard.jsx";
import RestaurantFilters from "../components/restaurant/RestaurantFilters.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import {
  adaptRestaurant,
  extractArray,
  extractCuisines,
  fetchFavoriteRestaurants,
  fetchRestaurants,
} from "../services/restaurantService.js";
import "../App.css";

const FOOD_CATEGORIES = [
  { name: "All", icon: "✦" },
  { name: "Burgers", icon: "🍔" },
  { name: "Pizza", icon: "🍕" },
  { name: "Noodles", icon: "🍜" },
  { name: "Snacks", icon: "🍟" },
  { name: "Drinks", icon: "🥤" },
  { name: "Indian", icon: "🍛" },
  { name: "Desserts", icon: "🍰" },
];

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "rating-desc", label: "Rating: High to Low" },
  { value: "delivery-asc", label: "Delivery Time: Fastest First" },
  { value: "name-asc", label: "Name: A to Z" },
];

export default function Restaurants({
  cartItems = [],
  onAddToCart,
  isDevelopmentPreview = false,
}) {
  const previewEnabled = import.meta.env.DEV && isDevelopmentPreview;

  const [searchParams] = useSearchParams();
  const initialSearchQuery = searchParams.get("q") || "";

  // Filter state
  const [searchText, setSearchText] = useState(initialSearchQuery);
  const [openNow, setOpenNow] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const { favorites, toggleFavorite, favoriteCount } = useFavorites();
  const [showFavorites, setShowFavorites] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sync search input if URL search query changes
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== searchText) {
      setSearchText(q);
    }
  }, [searchParams]);

  // Debounce search input by 350ms to avoid sending an API request on every keystroke
  const debouncedSearchText = useDebounce(searchText, 350);

  // Live backend restaurants state
  const [backendRestaurants, setBackendRestaurants] = useState([]);
  const [discoveredCuisines, setDiscoveredCuisines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch restaurants via backend API using supported parameters only
  // All search, filtering, and favorites are handled by the backend
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setApiError("");

    // If showFavorites is active, use the dedicated backend endpoint GET /api/customer/restaurants/favourites
    // Otherwise, call GET /api/customer/restaurants with the exact parameters supported by the API (q, open)
    const fetchPromise = showFavorites
      ? fetchFavoriteRestaurants({ limit: 50 })
      : fetchRestaurants({
          q: debouncedSearchText.trim() || undefined,
          open: openNow ? true : undefined,
        });

    fetchPromise
      .then((data) => {
        if (!isCurrent) return;
        const list = extractArray(data);
        const adapted = list.map(adaptRestaurant).filter(Boolean);

        // The frontend directly renders the restaurant list returned by the API
        // without applying client-side filtering or sorting
        setBackendRestaurants(adapted);

        // Accumulate cuisines discovered from backend data to populate the cuisine selector
        if (adapted.length > 0) {
          const newCuisines = extractCuisines(adapted);
          setDiscoveredCuisines((prev) => {
            const merged = new Set([...prev, ...newCuisines]);
            return Array.from(merged).sort((a, b) => a.localeCompare(b));
          });
        }
      })
      .catch((error) => {
        if (!isCurrent) return;
        setApiError(
          error instanceof Error
            ? error.message
            : "Could not retrieve live restaurants from backend.",
        );
        setBackendRestaurants([]);
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearchText, openNow, showFavorites, refreshTrigger]);

  // Clear all filters: resets all filter states
  function clearAllFilters() {
    setSearchText("");
    setOpenNow(false);
    setSelectedCuisine("All");
    setSelectedCategory("All");
    setSortBy("recommended");
    setShowFavorites(false);
  }

  function handleRetry() {
    setRefreshTrigger((prev) => prev + 1);
  }

  return (
    <div className="food-home" id="top">
      {/* 1. Top Navbar (Synced with search and favorites) */}
      <Navbar
        searchText={searchText}
        setSearchText={setSearchText}
        favoriteCount={favoriteCount}
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
          <div className="restaurants-page-header mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="section-kicker">DISCOVER FOOD</span>
              {!isLoading && !apiError && (
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
          </div>

          {/* Food Category Icons */}
          <CategorySection
            categories={FOOD_CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={(category) => {
              setSelectedCategory((current) =>
                current === category ? "All" : category,
              );
            }}
          />

          {/* Functional Restaurant Search & Filters */}
          <RestaurantFilters
            searchText={searchText}
            onSearchChange={setSearchText}
            onClearSearch={() => setSearchText("")}
            selectedCuisine={selectedCuisine}
            onCuisineChange={setSelectedCuisine}
            onClearCuisine={() => setSelectedCuisine("All")}
            availableCuisines={discoveredCuisines}
            openNow={openNow}
            onOpenNowChange={setOpenNow}
            onClearOpenNow={() => setOpenNow(false)}
            selectedCategory={selectedCategory}
            onClearCategory={() => setSelectedCategory("All")}
            showFavorites={showFavorites}
            onClearFavorites={() => setShowFavorites(false)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOptions={sortOptions}
            onClearFilters={clearAllFilters}
            totalCount={backendRestaurants.length}
            isLoading={isLoading}
          />

          {/* State 1: Loading State */}
          {isLoading ? (
            <div className="empty-results" role="status" aria-live="polite">
              <span
                className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-[#c92332]/20 border-t-[#c92332] mb-3"
                aria-hidden="true"
              />
              <h3 className="text-lg font-serif font-bold text-[#24211D]">
                {debouncedSearchText.trim()
                  ? `Searching for "${debouncedSearchText.trim()}"...`
                  : "Finding nearby kitchens..."}
              </h3>
              <p className="text-sm text-[#746C61]">
                Fetching approved restaurants from the backend.
              </p>
            </div>
          ) : apiError ? (
            /* State 2: API Error State */
            <div
              className="empty-results border-rose-200 bg-rose-50/50 p-6 rounded-2xl"
              role="alert"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3 text-rose-600">
                <AlertCircle size={24} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#24211D] mb-1">
                Unable to load restaurants
              </h3>
              <p className="text-sm text-[#746C61] max-w-md mx-auto mb-4">
                {apiError}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-[#c92332] text-white text-xs font-semibold rounded-xl hover:bg-[#a81c29] transition-colors cursor-pointer"
                  onClick={handleRetry}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-[#eee4d6] bg-white text-xs font-semibold text-[#746C61] rounded-xl hover:bg-[#fffefa] transition-colors cursor-pointer"
                  onClick={clearAllFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : backendRestaurants.length > 0 ? (
            /* State 3: Populated Results Grid — directly renders backend API response without client-side modifications */
            <div className="restaurant-grid">
              {backendRestaurants.map((restaurant) => {
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
            /* State 4: Empty Results State */
            <div className="empty-results">
              <div className="w-12 h-12 rounded-full bg-[#f3eae0] flex items-center justify-center mx-auto mb-3 text-[#c92332]">
                <UtensilsCrossed size={22} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#24211D] mb-1">
                No restaurants found
              </h3>
              <p className="text-sm text-[#746C61] max-w-md mx-auto mb-4">
                {showFavorites
                  ? "You have not saved any restaurants as favorites yet."
                  : debouncedSearchText.trim()
                  ? `No kitchens matching "${debouncedSearchText.trim()}". Try a different name or clear your search.`
                  : openNow
                  ? "No restaurants are currently open matching your criteria."
                  : "We couldn't find any approved restaurants matching your request."}
              </p>
              <button
                type="button"
                className="clear-search-button cursor-pointer"
                onClick={clearAllFilters}
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
