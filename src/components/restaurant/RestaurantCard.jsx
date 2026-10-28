import { useState } from "react";
import { Heart, MapPin, Star, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

export default function RestaurantCard({
  restaurant,
  isFavorite,
  onToggleFavorite,
  detailsBasePath = "/restaurants",
}) {
  const [imageError, setImageError] = useState(false);
  const detailsPath = `${detailsBasePath}/${restaurant.id}`;

  const hasMeta =
    Boolean(restaurant.time) ||
    typeof restaurant.fee === "number" ||
    Boolean(restaurant.address);

  const hasImage = Boolean(restaurant.image) && !imageError;

  return (
    <article className="restaurant-card">
      <div className="restaurant-image-wrap">
        <Link
          className="restaurant-card-image-link"
          to={detailsPath}
          aria-label={`View ${restaurant.name} menu`}
        >
          {hasImage ? (
            <img
              className="restaurant-image"
              src={restaurant.image}
              alt={`${restaurant.name} food`}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="restaurant-image-placeholder" aria-hidden="true">
              <Utensils size={32} className="text-[#c92332]/40" />
            </div>
          )}
          {restaurant.badge && (
            <span
              className={`restaurant-badge${
                restaurant.badge === "Closed" ? " is-closed" : ""
              }`}
            >
              {restaurant.badge}
            </span>
          )}
        </Link>
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
            stroke={isFavorite ? "none" : "currentColor"}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="restaurant-content">
        <div className="restaurant-title-row">
          <h3 className="restaurant-title">
            <Link to={detailsPath}>{restaurant.name}</Link>
          </h3>
          {restaurant.rating !== undefined && (
            <span className="restaurant-rating">
              <Star size={13} fill="currentColor" aria-hidden="true" />
              {restaurant.rating}
            </span>
          )}
        </div>

        <p className="restaurant-cuisine">{restaurant.cuisine}</p>

        {hasMeta && (
          <div className="restaurant-meta">
            {restaurant.time && (
              <span>
                {restaurant.time}
              </span>
            )}
            {typeof restaurant.fee === "number" && (
              <>
                {restaurant.time && <span className="meta-dot">·</span>}
                <span>
                  {restaurant.fee === 0
                    ? "Free delivery"
                    : `₹${restaurant.fee} delivery`}
                </span>
              </>
            )}
            {restaurant.address && !restaurant.time && (
              <span className="flex items-center gap-1 text-xs text-[#746C61] truncate">
                <MapPin size={12} aria-hidden="true" />
                {restaurant.address}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
