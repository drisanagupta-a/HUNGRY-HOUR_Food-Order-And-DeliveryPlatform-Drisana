import { ArrowLeft, Bike, Clock3, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import MenuItem from "../components/restaurant/MenuItem.jsx";
import { mockDishes, mockRestaurants } from "../data/mockRestaurants.js";
import "../App.css";

export default function RestaurantDetails({
  cartItems,
  onAddToCart,
  isDevelopmentPreview = false,
}) {
  const { restaurantId } = useParams();
  const previewEnabled = import.meta.env.DEV && isDevelopmentPreview;
  const homePath = previewEnabled ? "/dev-dashboard-preview" : "/home";
  const restaurant = mockRestaurants.find((item) => item.id === restaurantId);
  const restaurantMenu = mockDishes.filter(
    (dish) => dish.restaurantId === restaurantId,
  );
  const menuCategories = [...new Set(restaurantMenu.map((dish) => dish.category))];

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
        {restaurant ? (
          <>
            <section className="restaurant-detail-hero">
              <div className="restaurant-detail-hero-image">
                <img src={restaurant.image} alt={`${restaurant.name} dishes`} />
              </div>
              <div className="restaurant-detail-summary">
                <Link className="restaurant-back-link" to={homePath}>
                  <ArrowLeft size={16} aria-hidden="true" />
                  Back to restaurants
                </Link>
                <span className="restaurant-detail-badge">{restaurant.badge}</span>
                <h1>{restaurant.name}</h1>
                <p className="restaurant-detail-cuisine">{restaurant.cuisine}</p>
                <div className="restaurant-detail-meta">
                  <span className="restaurant-detail-rating">
                    <Star size={16} fill="currentColor" aria-hidden="true" />
                    {restaurant.rating} rating
                  </span>
                  <span>
                    <Clock3 size={16} aria-hidden="true" />
                    {restaurant.time}
                  </span>
                  <span>
                    <Bike size={16} aria-hidden="true" />
                    {restaurant.fee === 0
                      ? "Free delivery"
                      : `₹${restaurant.fee} delivery`}
                  </span>
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
                <p>{restaurantMenu.length} menu favorites</p>
              </div>

              {restaurantMenu.length > 0 ? (
                menuCategories.map((category) => (
                  <section
                    className="restaurant-menu-category"
                    key={category}
                    aria-labelledby={`menu-category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <h3
                      id={`menu-category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      {category}
                    </h3>
                    <div className="restaurant-menu-grid">
                      {restaurantMenu
                        .filter((dish) => dish.category === category)
                        .map((dish) => (
                          <MenuItem
                            key={dish.id}
                            dish={dish}
                            onAddToCart={onAddToCart}
                          />
                        ))}
                    </div>
                  </section>
                ))
              ) : (
                <div className="empty-results">
                  <span aria-hidden="true">🍽️</span>
                  <h3>Menu coming soon</h3>
                  <p>This restaurant does not have menu items listed yet.</p>
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
