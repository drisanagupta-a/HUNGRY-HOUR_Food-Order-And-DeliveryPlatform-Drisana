import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Sparkles, Star, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchRestaurantRecommendations } from "../../services/recommendationService.js";

const CUISINE_IMAGES = {
  indian:
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
  pizza:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  chinese:
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  burgers:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  dessert:
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  desserts:
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  continental:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  snacks:
    "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
  bakery:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  noodles:
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
};

function getCuisineImage(cuisine = "") {
  const lower = cuisine.toLowerCase();
  for (const [key, url] of Object.entries(CUISINE_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

export default function RecommendationSection({ selectedCategory = "All" }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    const cuisineParam =
      selectedCategory && selectedCategory !== "All"
        ? selectedCategory
        : undefined;

    fetchRestaurantRecommendations({
      cuisine: cuisineParam,
      limit: 6,
    })
      .then((data) => {
        if (!isCurrent) return;
        const list = Array.isArray(data?.recommendations)
          ? data.recommendations
          : [];
        setRecommendations(list);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.warn("ML recommendations unavailable:", err);
        setError(err instanceof Error ? err.message : "Unavailable");
        setRecommendations([]);
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedCategory]);

  // If there's an error and no recommendations, do not render a broken section
  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  return (
    <section className="home-section recommendation-section" id="recommendations">
      <div className="section-heading">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="section-kicker">AI-POWERED RECOMMENDATIONS</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-[#c92332] border border-[#c92332]/20">
              <Sparkles size={11} aria-hidden="true" /> ML Engine
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#24211D]">
            Recommended for you
          </h2>
          <p className="text-xs text-[#746C61] mt-1">
            Tailored kitchen picks scored and ranked by our machine learning model.
          </p>
        </div>
        <Link className="text-link inline-flex items-center gap-1" to="/restaurants">
          Explore all restaurants <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {isLoading ? (
        <div className="empty-results" role="status">
          <span
            className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#D90429]/20 border-t-[#D90429] mb-3"
            aria-hidden="true"
          />
          <h3>Calculating recommendations...</h3>
          <p>Analyzing kitchen ratings and flavor profiles.</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {recommendations.map((rec, index) => {
            const imageUrl = getCuisineImage(rec.cuisine);
            const matchPercentage =
              typeof rec.recommendation_score === "number" &&
              rec.recommendation_score > 0
                ? Math.round(rec.recommendation_score * 100)
                : null;
            const searchUrl = `/restaurants?q=${encodeURIComponent(rec.restaurant_name)}`;

            return (
              <article
                className="restaurant-card"
                key={rec.restaurant_name || index}
              >
                <div className="restaurant-image-wrap">
                  <Link
                    className="restaurant-card-image-link"
                    to={searchUrl}
                    aria-label={`Search for ${rec.restaurant_name}`}
                  >
                    {imageUrl ? (
                      <img
                        className="restaurant-image"
                        src={imageUrl}
                        alt={`${rec.restaurant_name} food`}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="restaurant-image-placeholder"
                        aria-hidden="true"
                      >
                        <Utensils size={32} className="text-[#c92332]/40" />
                      </div>
                    )}
                    {matchPercentage !== null ? (
                      <span className="restaurant-badge">
                        {matchPercentage}% Match
                      </span>
                    ) : (
                      <span className="restaurant-badge">ML Pick</span>
                    )}
                  </Link>
                </div>

                <div className="restaurant-content">
                  <div className="restaurant-title-row">
                    <h3 className="restaurant-title">
                      <Link to={searchUrl}>{rec.restaurant_name}</Link>
                    </h3>
                    {rec.rating !== undefined && (
                      <span className="restaurant-rating">
                        <Star size={13} fill="currentColor" aria-hidden="true" />
                        {Number(rec.rating).toFixed(1)}
                      </span>
                    )}
                  </div>

                  <p className="restaurant-cuisine">{rec.cuisine}</p>

                  {rec.location && (
                    <div className="restaurant-meta">
                      <span className="inline-flex items-center gap-1 text-xs text-[#746C61]">
                        <MapPin size={12} aria-hidden="true" />
                        {rec.location}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
