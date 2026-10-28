import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function RestaurantCard({
  restaurant,
  isFavorite,
  onToggleFavorite,
  detailsBasePath = "/restaurants",
}) {
  const detailsPath = `${detailsBasePath}/${restaurant.id}`;

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
            <div className="restaurant-image-placeholder" aria-hidden="true" />
          )}
          {restaurant.badge ? (
            <span className="restaurant-badge">{restaurant.badge}</span>
          ) : null}
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
          <span className="rating-pill">
            {restaurant.rating !== undefined ? (
              <>
                <Star size={13} fill="currentColor" aria-hidden="true" />
                {restaurant.rating}
              </>
            ) : (
              <Star size={13} fill="none" aria-hidden="true" />
            )}
          </span>
        </div>
        {restaurant.cuisine ? (
          <p className="restaurant-cuisine">{restaurant.cuisine}</p>
        ) : null}
        <div className="restaurant-meta">
          <span>{restaurant.time}</span>
          <i aria-hidden="true">Â·</i>
          <span>
            {restaurant.fee === 0
              ? "Free delivery"
              : `â‚¹${restaurant.fee} delivery`}
          </span>
        </div>
      </Link>
    </article>
  );
}
