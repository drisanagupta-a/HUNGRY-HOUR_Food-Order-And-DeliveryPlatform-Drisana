import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import {
  adaptRestaurant,
  extractArray,
  fetchFavoriteRestaurants,
} from "../services/restaurantService.js";

const FAVORITES_STORAGE_KEY = "hh_favorite_restaurant_ids";

const FavoritesContext = createContext(null);

function loadStoredFavorites() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (id) => typeof id === "string" && id.trim().length > 0,
      );
    }
  } catch (err) {
    console.warn("Failed to load favorites from localStorage:", err);
  }
  return [];
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(loadStoredFavorites);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");
  const inFlightIdsRef = useRef(new Set());
  const initialFetchDoneRef = useRef(false);

  // Sync favorites with localStorage so they persist across page refreshes
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.warn("Failed to save favorites to localStorage:", err);
    }
  }, [favorites]);

  // Load saved favourites from the backend GET /api/customer/restaurants/favourites
  // when an authenticated user opens the application
  const loadFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoadingFavorites(true);
    setFavoritesError("");

    try {
      const data = await fetchFavoriteRestaurants({ limit: 50 });
      const list = extractArray(data);
      const adapted = list.map(adaptRestaurant).filter(Boolean);
      setFavoriteRestaurants(adapted);

      const backendIds = adapted.map((r) => r.id).filter(Boolean);
      if (backendIds.length > 0) {
        setFavorites((prev) => {
          const merged = Array.from(new Set([...prev, ...backendIds]));
          return merged;
        });
      }
    } catch (err) {
      // Graceful error handling for backend API failures
      console.warn("Could not load favorites from backend:", err);
      setFavoritesError(
        err instanceof Error ? err.message : "Failed to load favorites",
      );
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [user]);

  // Load favorites when user logs in or mounts
  useEffect(() => {
    if (user && !initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      loadFavorites();
    }
    if (!user) {
      initialFetchDoneRef.current = false;
    }
  }, [user, loadFavorites]);

  // Toggle favorite with duplicate click guard (prevents duplicate requests on rapid clicks)
  const toggleFavorite = useCallback((restaurantId) => {
    if (!restaurantId) return;

    // Prevent duplicate requests / double clicks
    if (inFlightIdsRef.current.has(restaurantId)) {
      return;
    }
    inFlightIdsRef.current.add(restaurantId);

    setFavorites((prev) => {
      const isFav = prev.includes(restaurantId);
      const updated = isFav
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId];
      return updated;
    });

    // Release guard after brief timeout to prevent rapid multi-clicks
    setTimeout(() => {
      inFlightIdsRef.current.delete(restaurantId);
    }, 300);
  }, []);

  const isFavorite = useCallback(
    (restaurantId) => {
      if (!restaurantId) return false;
      return favorites.includes(restaurantId);
    },
    [favorites],
  );

  const value = {
    favorites,
    favoriteRestaurants,
    favoriteCount: favorites.length,
    isFavorite,
    toggleFavorite,
    loadFavorites,
    isLoadingFavorites,
    favoritesError,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
