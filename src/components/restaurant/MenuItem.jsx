import { Plus, Utensils } from "lucide-react";

export default function MenuItem({ dish, onAddToCart }) {
  const isAvailable = dish.available !== false;

  return (
    <article
      className={`menu-item-card${!isAvailable ? " opacity-60" : ""}`}
    >
      <div className="menu-item-image-wrap">
        {dish.image ? (
          <img src={dish.image} alt={dish.name} loading="lazy" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-[#f7efe4] text-[#c92332]/40"
            aria-hidden="true"
          >
            <Utensils size={28} />
          </div>
        )}
      </div>
      <div className="menu-item-copy">
        <p className="menu-item-category">{dish.category}</p>
        <h4>{dish.name}</h4>
        <p className="menu-item-description">{dish.description}</p>
        <div className="menu-item-bottom">
          <span className="menu-item-price">₹{dish.price}</span>
          {isAvailable ? (
            <button
              type="button"
              className="add-dish-button"
              onClick={() => onAddToCart(dish)}
              aria-label={`Add ${dish.name} to your bag`}
            >
              <Plus size={14} aria-hidden="true" />
              Add
            </button>
          ) : (
            <span className="rounded-lg bg-[#eee4d6] px-2.5 py-1 text-xs font-semibold text-[#746C61]">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
