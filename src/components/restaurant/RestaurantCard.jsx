import { Heart, MapPin, Star, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

export default function RestaurantCard({
  restaurant,
  isFavorite,
  onToggleFavorite,
  detailsBasePath = "/restaurants",
}) {
  const detailsPath = `${detailsBasePath}/${restaurant.id}`;

  const hasMeta =
    Boolean(restaurant.time) ||
    typeof restaurant.fee === "number" ||
    Boolean(restaurant.address);

  return (
    <article className="restaurant-card">
      <div className="restaurant-image-wrap">
        <Link
          className="restaurant-card-image-link"
          to={detailsPath}
          aria-label={`View ${restaurant.name} menu`}
        >
          {restaurant.image ? (
            <img
              className="restaurant-image"
              src={restaurant.image}
              alt={`${restaurant.name} food`}
              loading="lazy"
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
            aria-hidden="true"
          />
        </button>
      </div>

      <Link
        className="restaurant-card-copy restaurant-card-details-link"
        to={detailsPath}
        aria-label={`View ${restaurant.name} details and menu`}
      >
        <div className="restaurant-title-row">
          <h3>{restaurant.name}</h3>
          {restaurant.rating !== undefined && (
            <span className="rating-pill">
              <Star size={13} fill="currentColor" aria-hidden="true" />
              {restaurant.rating}
            </span>
          )}
        </div>

        {restaurant.cuisine && (
          <p className="restaurant-cuisine">{restaurant.cuisine}</p>
        )}

        {hasMeta && (
          <div className="restaurant-meta">
            {restaurant.time && <span>{restaurant.time}</span>}
            {restaurant.time && typeof restaurant.fee === "number" && (
              <i aria-hidden="true">·</i>
            )}
            {typeof restaurant.fee === "number" && (
              <span>
                {restaurant.fee === 0
                  ? "Free delivery"
                  : `₹${restaurant.fee} delivery`}
              </span>
            )}
            {!restaurant.time &&
              typeof restaurant.fee !== "number" &&
              restaurant.address && (
                <span className="flex items-center gap-1 text-xs truncate">
                  <MapPin size={12} aria-hidden="true" />
                  {restaurant.address}
                </span>
              )}
          </div>
        )}
      </Link>
    </article>
  );
}
