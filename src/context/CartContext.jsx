import { createContext, useContext, useEffect, useState } from "react";

const CART_STORAGE_KEY = "hh_cart_items";

const CartContext = createContext(null);

function loadSavedCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) => item && item.id && typeof item.price === "number" && item.quantity > 0,
      );
    }
  } catch (err) {
    console.warn("Failed to parse cart items from localStorage:", err);
  }
  return [];
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadSavedCart);
  const [conflictDialog, setConflictDialog] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.warn("Failed to save cart items to localStorage:", err);
    }
  }, [cartItems]);

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  const cartSubtotal = cartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0,
  );

  const restaurantId = cartItems[0]?.restaurantId || null;
  const restaurantName =
    cartItems[0]?.restaurantName || cartItems[0]?.restaurant || "";

  function addToCart(dish, quantity = 1) {
    if (!dish || !dish.id) return;

    // Check single-restaurant restriction
    const currentRestId = cartItems[0]?.restaurantId;
    const incomingRestId = dish.restaurantId;

    if (
      cartItems.length > 0 &&
      currentRestId &&
      incomingRestId &&
      currentRestId !== incomingRestId
    ) {
      // Conflict: item from another restaurant
      setConflictDialog({
        pendingItem: dish,
        pendingQuantity: quantity,
        currentRestaurant:
          cartItems[0]?.restaurantName ||
          cartItems[0]?.restaurant ||
          "another restaurant",
        newRestaurant:
          dish.restaurantName || dish.restaurant || "a different restaurant",
      });
      return;
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === dish.id);
      if (existingIndex > -1) {
        return prevItems.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item,
        );
      }
      return [...prevItems, { ...dish, quantity }];
    });
  }

  function confirmConflictReplace() {
    if (conflictDialog?.pendingItem) {
      const { pendingItem, pendingQuantity } = conflictDialog;
      setCartItems([{ ...pendingItem, quantity: pendingQuantity || 1 }]);
    }
    setConflictDialog(null);
  }

  function cancelConflict() {
    setConflictDialog(null);
  }

  function updateQuantity(dishId, newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === dishId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  }

  function incrementQuantity(dishId) {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === dishId
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item,
      ),
    );
  }

  function decrementQuantity(dishId) {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === dishId);
      if (!existing) return prevItems;
      if (existing.quantity <= 1) {
        return prevItems.filter((item) => item.id !== dishId);
      }
      return prevItems.map((item) =>
        item.id === dishId ? { ...item, quantity: item.quantity - 1 } : item,
      );
    });
  }

  function removeFromCart(dishId) {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== dishId),
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    restaurantId,
    restaurantName,
    addToCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
    conflictDialog,
    confirmConflictReplace,
    cancelConflict,
  };

  return (
    <CartContext.Provider value={value}>
      {children}

      {/* Accessible Restaurant Conflict Modal */}
      {conflictDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="conflict-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#eee4d6] bg-[#fffefa] p-6 shadow-2xl">
            <h2
              id="conflict-title"
              className="font-serif text-xl font-bold text-[#24211d]"
            >
              Start a new order?
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5F584F]">
              Your bag already contains dishes from{" "}
              <strong className="text-[#24211d]">
                {conflictDialog.currentRestaurant}
              </strong>
              . Your order can only contain dishes from one restaurant at a
              time.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5F584F]">
              Would you like to clear your current bag and start a fresh order
              with dishes from{" "}
              <strong className="text-[#24211d]">
                {conflictDialog.newRestaurant}
              </strong>
              ?
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelConflict}
                className="rounded-xl border border-[#ddd3c7] bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#5F584F] hover:bg-[#fffaf2] transition"
              >
                Keep current order
              </button>
              <button
                type="button"
                onClick={confirmConflictReplace}
                className="rounded-xl bg-[#c92332] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#a81725] shadow transition"
              >
                Clear & start new order
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
