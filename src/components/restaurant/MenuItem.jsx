import { Plus } from "lucide-react";

export default function MenuItem({ dish, onAddToCart }) {
  return (
    <article className="menu-item-card">
      <div className="menu-item-image-wrap">
        <img src={dish.image} alt={dish.name} loading="lazy" />
      </div>
      <div className="menu-item-copy">
        <p className="menu-item-category">{dish.category}</p>
        <h4>{dish.name}</h4>
        <p className="menu-item-description">{dish.description}</p>
        <div className="menu-item-bottom">
          <span className="menu-item-price">₹{dish.price}</span>
          <button
            type="button"
            className="add-dish-button"
            onClick={() => onAddToCart(dish)}
            aria-label={`Add ${dish.name} to your bag`}
          >
            <Plus size={14} aria-hidden="true" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
