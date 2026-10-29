import { useEffect, useState } from "react";
import { ArrowLeft, Bike, Clock3, MapPin, Star, Utensils } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import MenuItem from "../components/restaurant/MenuItem.jsx";
import { mockDishes, mockRestaurants } from "../data/mockRestaurants.js";
import {
  adaptFoodItem,
  adaptRestaurant,
  extractArray,
  fetchRestaurantById,
  fetchRestaurantFoodItems,
} from "../services/restaurantService.js";
import "../App.css";

export default function RestaurantDetails({
  cartItems,
  onAddToCart,
  isDevelopmentPreview = false,
}) {
  const { restaurantId } = useParams();
  const previewEnabled = import.meta.env.DEV && isDevelopmentPreview;
  const homePath = previewEnabled ? "/dev-dashboard-preview" : "/home";

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [heroImageError, setHeroImageError] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setErrorMessage("");

    // Attempt to load from live backend first
    Promise.allSettled([
      fetchRestaurantById(restaurantId),
      fetchRestaurantFoodItems(restaurantId),
    ])
      .then(([restaurantResult, menuResult]) => {
        if (!isCurrent) return;

        let resolvedRestaurant = null;
        let resolvedMenu = [];

        if (
          restaurantResult.status === "fulfilled" &&
          restaurantResult.value
        ) {
          resolvedRestaurant = adaptRestaurant(restaurantResult.value);
        }

        if (menuResult.status === "fulfilled" && menuResult.value) {
          const rawItems = extractArray(menuResult.value);
          if (rawItems.length > 0) {
            resolvedMenu = rawItems.map(adaptFoodItem).filter(Boolean);
          }
        }

        // If backend did not return the restaurant, check fallback mock catalog
        if (!resolvedRestaurant) {
          const fallbackRestaurant = mockRestaurants.find(
            (item) => item.id === restaurantId,
          );
          if (fallbackRestaurant) {
            resolvedRestaurant = fallbackRestaurant;
          }
        }

        // If backend did not return menu items, check fallback mock catalog
        if (resolvedMenu.length === 0) {
          const fallbackMenu = mockDishes.filter(
            (dish) => dish.restaurantId === restaurantId,
          );
          if (fallbackMenu.length > 0) {
            resolvedMenu = fallbackMenu;
          }
        }

        setRestaurant(resolvedRestaurant);
        setMenuItems(resolvedMenu);
      })
      .catch((err) => {
        if (!isCurrent) return;
        // Fallback to mock catalog on network/auth error
        const fallbackRestaurant = mockRestaurants.find(
          (item) => item.id === restaurantId,
        );
        const fallbackMenu = mockDishes.filter(
          (dish) => dish.restaurantId === restaurantId,
        );

        setRestaurant(fallbackRestaurant || null);
        setMenuItems(fallbackMenu || []);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Could not reach restaurant server.",
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
  }, [restaurantId]);

  const menuCategories = [
    "All",
    ...new Set(menuItems.map((dish) => dish.category).filter(Boolean)),
  ];

  const filteredMenuItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((dish) => dish.category === selectedCategory);

  const displayedCategories =
    selectedCategory === "All"
      ? [...new Set(menuItems.map((dish) => dish.category).filter(Boolean))]
      : [selectedCategory];

  return (
    <div className="food-home restaurant-details-page">
      <Navbar
        favoriteCount={0}
        cartItems={cartItems}
        homePath={homePath}
        showSearch={false}
        showFavorites={false}
        showNavigation={false}
        showLogout={!previewEnabled}
      />

      <main>
        {isLoading ? (
          <div className="empty-results py-24" role="status">
            <span
              className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#c92332]/20 border-t-[#c92332] mb-4"
              aria-hidden="true"
            />
            <h2>Loading restaurant menu...</h2>
            <p>Fetching menu details and dishes from the kitchen.</p>
          </div>
        ) : restaurant ? (
          <>
            <section className="restaurant-detail-hero">
              <div className="restaurant-detail-hero-image">
                {restaurant.image && !heroImageError ? (
                  <img
                    src={restaurant.image}
                    alt={`${restaurant.name} dishes`}
                    onError={() => setHeroImageError(true)}
                  />
                ) : (
                  <div
                    className="flex h-full min-h-[220px] w-full items-center justify-center bg-[#f7efe4] text-[#c92332]/40"
                    aria-hidden="true"
                  >
                    <Utensils size={48} />
                  </div>
                )}
              </div>
              <div className="restaurant-detail-summary">
                <Link className="restaurant-back-link" to={homePath}>
                  <ArrowLeft size={16} aria-hidden="true" />
                  Back to restaurants
                </Link>

                <div className="flex items-center gap-2">
                  {restaurant.badge && (
                    <span
                      className={`restaurant-detail-badge${
                        restaurant.badge === "Closed" ? " bg-[#746C61]" : ""
                      }`}
                    >
                      {restaurant.badge}
                    </span>
                  )}
                  {restaurant.isBackendData && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Live Kitchen
                    </span>
                  )}
                </div>

                <h1>{restaurant.name}</h1>
                <p className="restaurant-detail-cuisine">{restaurant.cuisine}</p>

                <div className="restaurant-detail-meta">
                  {restaurant.rating !== undefined && (
                    <span className="restaurant-detail-rating">
                      <Star size={16} fill="currentColor" aria-hidden="true" />
                      {restaurant.rating} rating
                    </span>
                  )}
                  {restaurant.time && (
                    <span>
                      <Clock3 size={16} aria-hidden="true" />
                      {restaurant.time}
                    </span>
                  )}
                  {typeof restaurant.fee === "number" && (
                    <span>
                      <Bike size={16} aria-hidden="true" />
                      {restaurant.fee === 0
                        ? "Free delivery"
                        : `₹${restaurant.fee} delivery`}
                    </span>
                  )}
                  {restaurant.address && !restaurant.time && (
                    <span className="flex items-center gap-1 text-sm text-[#746C61]">
                      <MapPin size={16} aria-hidden="true" />
                      {restaurant.address}
                    </span>
                  )}
                </div>

                <p className="restaurant-detail-note">
                  Explore the menu and add your favorites to your bag.
                </p>
              </div>
            </section>

            <section className="restaurant-menu-section">
              <div className="restaurant-menu-heading">
                <div>
                  <p className="section-kicker">MADE FOR YOUR CRAVINGS</p>
                  <h2>Our menu</h2>
                </div>
                <p>{menuItems.length} menu favorites</p>
              </div>

              {menuCategories.length > 1 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {menuCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                        selectedCategory === cat
                          ? "bg-[#D1011F] text-white"
                          : "border border-[#eee4d6] bg-white text-[#5F584F] hover:bg-[#fffaf2]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {filteredMenuItems.length > 0 ? (
                displayedCategories.map((category) => {
                  const itemsInCategory = filteredMenuItems.filter(
                    (dish) => dish.category === category,
                  );
                  if (itemsInCategory.length === 0) return null;

                  return (
                    <section
                      className="restaurant-menu-category"
                      key={category}
                      aria-labelledby={`menu-category-${category
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`}
                    >
                      <h3
                        id={`menu-category-${category
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`}
                      >
                        {category}
                      </h3>
                      <div className="restaurant-menu-grid">
                        {itemsInCategory.map((dish) => (
                          <MenuItem
                            key={dish.id || `${dish.name}-${dish.category}`}
                            dish={dish}
                            onAddToCart={(item) =>
                              onAddToCart?.({
                                ...item,
                                restaurantId: item.restaurantId || restaurant?.id || restaurantId,
                                restaurantName: item.restaurantName || restaurant?.name || "",
                              })
                            }
                          />
                        ))}
                      </div>
                    </section>
                  );
                })
              ) : (
                <div className="empty-results">
                  <span aria-hidden="true">🍽️</span>
                  <h3>Menu coming soon</h3>
                  <p>
                    {errorMessage
                      ? `Notice: ${errorMessage}`
                      : "This restaurant does not have menu items listed yet."}
                  </p>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="restaurant-not-found">
            <span aria-hidden="true">🍽️</span>
            <p className="section-kicker">NOT ON THE MENU</p>
            <h1>We couldn&apos;t find that restaurant.</h1>
            <p>
              It may have moved, or the restaurant link may be out of date.
            </p>
            <Link className="restaurant-not-found-link" to={homePath}>
              <ArrowLeft size={16} aria-hidden="true" />
              Return to restaurants
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
