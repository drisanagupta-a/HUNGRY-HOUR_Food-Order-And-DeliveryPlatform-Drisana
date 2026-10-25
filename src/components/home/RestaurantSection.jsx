import RestaurantCard from "../restaurant/RestaurantCard.jsx";

export default function RestaurantSection({
  restaurants,
  favorites,
  showFavorites,
  onToggleFavorite,
  onClearFilters,
  detailsBasePath = "/restaurants",
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
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
                detailsBasePath={detailsBasePath}
              />
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