import { Plus, Star } from "lucide-react";

export default function PopularDishes({
  dishes,
  onAddToCart,
  onClearFilters,
}) {
  return (
    <section className="home-section popular-section" id="popular-dishes">
      <div className="section-heading">
        <div>
          <p className="section-kicker">A FEW CAN&apos;T-MISS BITES</p>
          <h2>Popular for a reason.</h2>
        </div>
        <span className="section-aside">Handpicked happy-making dishes</span>
      </div>
      {dishes.length > 0 ? (
        <div className="dish-grid">
          {dishes.map((dish) => (
            <article className="dish-card" key={dish.id}>
              <div className="dish-image-wrap">
                <img src={dish.image} alt={dish.name} loading="lazy" />
                <span className="dish-rating">
                  <Star size={12} fill="currentColor" aria-hidden="true" />
                  {dish.rating}
                </span>
              </div>
              <div className="dish-card-copy">
                <p className="dish-restaurant">{dish.restaurant}</p>
                <h3>{dish.name}</h3>
                <div className="dish-bottom-row">
                  <span className="dish-price">₹{dish.price}</span>
                  <button
                    className="add-dish-button"
                    type="button"
                    onClick={() => onAddToCart(dish)}
                    aria-label={`Add ${dish.name} to your sample bag`}
                  >
                    <Plus size={17} aria-hidden="true" />
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-results empty-dishes">
          <span aria-hidden="true">🥄</span>
          <h3>No dishes match this search.</h3>
          <p>Clear your filters to see all the good stuff.</p>
          <button className="outline-button" type="button" onClick={onClearFilters}>
            Show all dishes
          </button>
        </div>
      )}
    </section>
  );
}