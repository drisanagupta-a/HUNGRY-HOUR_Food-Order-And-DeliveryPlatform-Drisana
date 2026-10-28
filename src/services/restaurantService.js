import { requestJson } from "./authService.js";

/**
 * Safely extracts an array from various backend response formats
 * (e.g., bare array, Spring Data Page { content: [...] }, or object wrappers).
 */
export function extractArray(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.content)) return response.content;
  if (response && Array.isArray(response.data)) return response.data;
  if (response && Array.isArray(response.items)) return response.items;
  if (response && Array.isArray(response.foodItems)) return response.foodItems;
  if (response && Array.isArray(response.restaurants)) return response.restaurants;
  return [];
}

/**
 * Fetch approved restaurants from the backend.
 * Endpoint: GET /api/customer/restaurants
 * Requires authenticated customer session (sb-access-token cookie).
 */
export async function fetchRestaurants({ q, open } = {}) {
  const params = new URLSearchParams();
  if (q && q.trim()) {
    params.append("q", q.trim());
  }
  if (typeof open === "boolean") {
    params.append("open", String(open));
  }
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return requestJson(`/api/customer/restaurants${queryString}`, "GET", undefined, true);
}

/**
 * Fetch specific restaurant details by ID.
 * Endpoint: GET /api/customer/restaurants/{restaurantId}
 */
export async function fetchRestaurantById(restaurantId) {
  if (!restaurantId) {
    throw new Error("Restaurant ID is required.");
  }
  return requestJson(
    `/api/customer/restaurants/${encodeURIComponent(restaurantId)}`,
    "GET",
    undefined,
    true,
  );
}

/**
 * Fetch available food items/menu for a restaurant.
 * Endpoint: GET /api/customer/restaurants/{restaurantId}/food-items
 */
export async function fetchRestaurantFoodItems(
  restaurantId,
  { q, category } = {},
) {
  if (!restaurantId) {
    throw new Error("Restaurant ID is required.");
  }
  const params = new URLSearchParams();
  if (q && q.trim()) {
    params.append("q", q.trim());
  }
  if (category && category !== "All") {
    params.append("category", category);
  }
  const queryString = params.toString() ? `?${params.toString()}` : "";
  return requestJson(
    `/api/customer/restaurants/${encodeURIComponent(restaurantId)}/food-items${queryString}`,
    "GET",
    undefined,
    true,
  );
}

/**
 * Formats backend category enum into human-friendly category titles.
 */
export function formatCategoryName(category) {
  if (!category) return "Menu Items";
  const titles = {
    STARTER: "Starters",
    MAIN_COURSE: "Main Course",
    BREAD: "Breads",
    RICE: "Rice Dishes",
    DESSERT: "Desserts",
    BEVERAGE: "Beverages",
    SNACK: "Snacks",
    OTHER: "Other Items",
  };
  const key = String(category).trim().toUpperCase();
  return titles[key] || category || "Menu Items";
}

/**
 * Adapts backend RestaurantResponse to the structure expected by the UI.
 * Does NOT invent fake ratings, delivery fees, or delivery times.
 */
export function adaptRestaurant(raw) {
  if (!raw) return null;

  return {
    id: raw.id,
    name: raw.name || "Unnamed Restaurant",
    address: raw.address || "",
    cuisine: raw.cuisine || "Specialty Kitchen",
    open: Boolean(raw.open),
    badge: raw.open ? "Open Now" : "Closed",
    // Neutral omission: ratings, times, fees are not faked if backend doesn't provide them
    rating: typeof raw.rating === "number" ? raw.rating : undefined,
    time: raw.time || undefined,
    fee: typeof raw.fee === "number" ? raw.fee : undefined,
    image: raw.image || raw.imageUrl || "",
    isBackendData: true,
  };
}

/**
 * Adapts backend FoodItemResponse to the structure expected by MenuItem.
 */
export function adaptFoodItem(raw) {
  if (!raw) return null;

  return {
    id: raw.id || `${raw.name || "dish"}-${raw.restaurantId || ""}`,
    restaurantId: raw.restaurantId,
    name: raw.name || "Unnamed Dish",
    description: raw.description || "",
    price: typeof raw.price === "number" ? raw.price : Number(raw.price) || 0,
    image: raw.imageUrl || raw.image || "",
    available: raw.available !== false,
    category: formatCategoryName(raw.category),
    rawCategory: raw.category,
    isBackendData: true,
  };
}
