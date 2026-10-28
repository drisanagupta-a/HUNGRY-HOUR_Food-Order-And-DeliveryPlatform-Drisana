import RestaurantCard from "../restaurant/RestaurantCard.jsx";

export default function RestaurantSection({
  restaurants,
  favorites,
  showFavorites,
  onToggleFavorite,
  onClearFilters,
  detailsBasePath = "/restaurants",
  isLoading = false,
  isFallback = false,
  apiError = "",
}) {
  return (
    <section className="home-section restaurant-section" id="restaurants">
      <div className="section-heading">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="section-kicker">LOCAL FAVORITES</p>
            {isFallback ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f3eae0] text-[#746C61] border border-[#e4d6c5]">
                Sample Catalog Fallback
              </span>
            ) : restaurants.length > 0 && !isLoading ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Backend
              </span>
            ) : null}
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#24211D]">
            {showFavorites ? "Your favorite restaurants" : "Top restaurants near you"}
          </h2>
          {apiError && isFallback && (
            <p className="text-xs text-[#746C61] mt-1">
              Backend notice: {apiError}. Showing sample restaurants.
            </p>
          )}
        </div>
        <a className="text-link" href="#popular-dishes">
          See what&apos;s cooking <span aria-hidden="true">↓</span>
        </a>
      </div>

      {isLoading ? (
        <div className="empty-results" role="status">
          <span
            className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#D90429]/20 border-t-[#D90429] mb-3"
            aria-hidden="true"
          />
          <h3>Finding nearby kitchens...</h3>
          <p>Fetching approved restaurants from the backend.</p>
        </div>
      ) : restaurants.length > 0 ? (
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
          <button
            className="outline-button"
            type="button"
            onClick={onClearFilters}
          >
            Show all restaurants
          </button>
        </div>
      )}
    </section>
  );
}
