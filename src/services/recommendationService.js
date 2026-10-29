import { requestJson } from "./authService.js";

/**
 * Check ML recommendation service health.
 * Endpoint: GET /api/customer/ml/health
 *
 * Returns 200 with health details when the downstream ML container is healthy,
 * or 503 Service Unavailable when the ML engine is waking up or unavailable.
 */
export async function checkMlHealth() {
  return requestJson("/api/customer/ml/health", "GET", undefined, true);
}

/**
 * Fetch restaurant recommendations based on cuisine, location, price, and rating filters.
 * Endpoint: GET /api/customer/ml/restaurant-recommendations
 *
 * Query parameters (OpenAPI):
 * - cuisine (string, optional): Cuisine preference
 * - location (string, optional): Customer location string
 * - maxPrice (number, optional): Maximum budget filter
 * - minRating (number, optional): Minimum rating threshold
 * - limit (integer, optional, default: 10): Max results count
 */
export async function fetchRestaurantRecommendations({
  cuisine,
  location,
  maxPrice,
  minRating,
  limit = 10,
} = {}) {
  const params = new URLSearchParams();
  if (cuisine) params.append("cuisine", cuisine);
  if (location) params.append("location", location);
  if (typeof maxPrice === "number") params.append("maxPrice", String(maxPrice));
  if (typeof minRating === "number") params.append("minRating", String(minRating));
  if (typeof limit === "number") params.append("limit", String(limit));

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return requestJson(
    `/api/customer/ml/restaurant-recommendations${queryString}`,
    "GET",
    undefined,
    true,
  );
}

/**
 * Fetch personalized food recommendations based on customer's previous order history.
 * Endpoint: GET /api/customer/ml/previous-order-recommendations
 *
 * Query parameters (OpenAPI):
 * - location (string, optional)
 * - maxPrice (number, optional)
 * - minRating (number, optional)
 * - limit (integer, optional, default: 10)
 *
 * Expected response: ForYouResponse {
 *   personalised: boolean,
 *   basedOnCuisines: string[],
 *   recommendations: Array<{ cuisine: string, results: JsonNode }>
 * }
 */
export async function fetchPreviousOrderRecommendations({
  location,
  maxPrice,
  minRating,
  limit = 10,
} = {}) {
  const params = new URLSearchParams();
  if (location) params.append("location", location);
  if (typeof maxPrice === "number") params.append("maxPrice", String(maxPrice));
  if (typeof minRating === "number") params.append("minRating", String(minRating));
  if (typeof limit === "number") params.append("limit", String(limit));

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return requestJson(
    `/api/customer/ml/previous-order-recommendations${queryString}`,
    "GET",
    undefined,
    true,
  );
}

/**
 * Fetch estimated delivery time based on distance, traffic, and weather conditions.
 * Endpoint: GET /api/customer/ml/orders/{orderId}/delivery-estimate
 *
 * Path parameter: orderId (uuid)
 * Query parameters (OpenAPI):
 * - distanceKm (number, optional)
 * - traffic (string, optional)
 * - weather (string, optional)
 *
 * Expected response: DeliveryEstimateResponse {
 *   estimatedMinutes: number,
 *   distanceSource: string,
 *   raw: JsonNode
 * }
 */
export async function fetchDeliveryEstimate(
  orderId,
  { distanceKm, traffic, weather } = {},
) {
  if (!orderId) {
    throw new Error("Order ID is required for delivery estimate.");
  }
  const params = new URLSearchParams();
  if (typeof distanceKm === "number") params.append("distanceKm", String(distanceKm));
  if (traffic) params.append("traffic", traffic);
  if (weather) params.append("weather", weather);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return requestJson(
    `/api/customer/ml/orders/${encodeURIComponent(orderId)}/delivery-estimate${queryString}`,
    "GET",
    undefined,
    true,
  );
}
