import { useState } from "react";
import { Plus, Utensils } from "lucide-react";

export default function MenuItem({ dish, onAddToCart }) {
  const [imageError, setImageError] = useState(false);
  const isAvailable = dish?.available !== false;
  const image = dish?.image || dish?.imageUrl;
  const hasImage = Boolean(image) && !imageError;

  return (
    <article
      className={`menu-item-card${!isAvailable ? " opacity-60" : ""}`}
    >
      <div className="menu-item-image-wrap">
        {hasImage ? (
          <img
            src={image}
            alt={dish?.name || "Dish"}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="menu-item-image-placeholder"
            aria-hidden="true"
          >
            <Utensils size={28} />
          </div>
        )}
      </div>
      <div className="menu-item-copy">
        {dish?.category && (
          <p className="menu-item-category">{dish.category}</p>
        )}
        <h4>{dish?.name || "Unnamed Dish"}</h4>
        {dish?.description ? (
          <p className="menu-item-description">{dish.description}</p>
        ) : null}
        <div className="menu-item-bottom">
          <span className="menu-item-price">₹{dish?.price ?? 0}</span>
          {isAvailable ? (
            <button
              type="button"
              className="add-dish-button"
              onClick={() => onAddToCart?.(dish)}
              aria-label={`Add ${dish?.name || "item"} to your bag`}
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
