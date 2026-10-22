import { Heart, Star } from "lucide-react";

export default function RestaurantSection({
  restaurants,
  favorites,
  showFavorites,
  onToggleFavorite,
  onClearFilters,
}) {
  return (
    <section className="home-section restaurant-section" id="restaurants">
      <div className="section-heading">
        <div>
          <p className="section-kicker">THE NEIGHBORHOOD TABLE</p>
          <h2>{showFavorites ? "Your lovely favorites." : "Places we love."}</h2>
        </div>
        <a className="text-link" href="#popular-dishes">
          See what&apos;s cooking <span aria-hidden="true">↓</span>
        </a>
      </div>
      {restaurants.length > 0 ? (
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => {
            const isFavorite = favorites.includes(restaurant.id);

            return (
              <article className="restaurant-card" key={restaurant.id}>
                <div className="restaurant-image-wrap">
                  <img
                    className="restaurant-image"
                    src={restaurant.image}
                    alt={`${restaurant.name} food`}
                    loading="lazy"
                  />
                  <span className="restaurant-badge">{restaurant.badge}</span>
                  <button
                    className={`favorite-button${isFavorite ? " is-favorite" : ""}`}
                    type="button"
                    onClick={() => onToggleFavorite(restaurant.id)}
                    aria-label={
                      isFavorite
                        ? `Remove ${restaurant.name} from favorites`
                        : `Add ${restaurant.name} to favorites`
                    }
                    aria-pressed={isFavorite}
                  >
                    <Heart
                      size={18}
                      fill={isFavorite ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div className="restaurant-card-copy">
                  <div className="restaurant-title-row">
                    <h3>{restaurant.name}</h3>
                    <span className="rating-pill">
                      <Star size={13} fill="currentColor" aria-hidden="true" />
                      {restaurant.rating}
                    </span>
                  </div>
                  <p className="restaurant-cuisine">{restaurant.cuisine}</p>
                  <div className="restaurant-meta">
                    <span>{restaurant.time}</span>
                    <i aria-hidden="true">·</i>
                    <span>
                      {restaurant.fee === 0
                        ? "Free delivery"
                        : `₹${restaurant.fee} delivery`}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-results">
          <span aria-hidden="true">🍽️</span>
          <h3>No restaurants found just yet.</h3>
          <p>Try a different search or clear your filters.</p>
          <button className="outline-button" type="button" onClick={onClearFilters}>
            Show all restaurants
          </button>
        </div>
      )}
    </section>
  );
}