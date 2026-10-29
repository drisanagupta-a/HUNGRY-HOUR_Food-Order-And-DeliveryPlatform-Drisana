import { useLayoutEffect, useState } from "react";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Sidebar from "../components/common/Sidebar.jsx";
import Footer from "../components/common/Footer.jsx";
import CartItem from "../components/cart/CartItem.jsx";
import OrderSummary from "../components/cart/OrderSummary.jsx";
import { useCart } from "../context/CartContext.jsx";
import "../App.css";

export default function Cart() {
  const location = useLocation();

  // Ensure the page always opens at the very top and prevent browser scroll restoration retention
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const originalScrollRestoration = window.history.scrollRestoration;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    return () => {
      if ("scrollRestoration" in window.history && originalScrollRestoration) {
        window.history.scrollRestoration = originalScrollRestoration;
      }
    };
  }, [location.pathname]);

  const {
    cartItems,
    cartSubtotal,
    restaurantName,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  function handleConfirmClear() {
    clearCart();
    setShowClearConfirm(false);
  }

  return (
    <div className="food-home cart-page" id="top">
      <Navbar
        favoriteCount={0}
        cartItems={cartItems}
        homePath="/home"
        showSearch={false}
        showFavorites={false}
        showNavigation={true}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        cartCount={cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)}
        activeSection="cart"
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#c92332] hover:underline"
          >
            <ArrowLeft size={16} />
            Continue Browsing
          </Link>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#746C61] hover:text-[#c92332] transition"
            >
              <Trash2 size={14} />
              Clear Bag
            </button>
          )}
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#c92332]">
            YOUR SELECTIONS
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24211d]">
            Your Food Bag
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-12 text-center shadow-sm">
            <ShoppingBag
              size={52}
              className="text-[#c92332]/40 mx-auto mb-4"
              aria-hidden="true"
            />
            <h2 className="text-xl font-serif font-semibold text-[#24211d] mb-2">
              Your bag is empty
            </h2>
            <p className="text-sm text-[#746C61] mb-6 max-w-sm mx-auto">
              You haven&apos;t added any delicious dishes yet. Explore our top restaurants to fill your bag.
            </p>
            <Link
              to="/restaurants"
              className="inline-block rounded-full bg-[#c92332] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#a81725] shadow-sm"
            >
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Item list */}
            <div className="lg:col-span-2">
              <div className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#eee4d6] mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#746C61]">
                    {restaurantName ? `From ${restaurantName}` : "Dishes"}
                  </span>
                  <span className="text-xs text-[#746C61]">
                    {cartItems.length} {cartItems.length === 1 ? "dish" : "dishes"}
                  </span>
                </div>

                <div className="divide-y divide-[#eee4d6]">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onIncrement={incrementQuantity}
                      onDecrement={decrementQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={cartSubtotal}
                deliveryFee={0}
                restaurantName={restaurantName}
                actionButton={
                  <Link
                    to="/checkout"
                    className="block w-full text-center rounded-full bg-[#c92332] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#a81725]"
                  >
                    Proceed to Checkout • ₹{cartSubtotal}
                  </Link>
                }
              />
            </div>
          </div>
        )}
      </main>

      {/* Clear Cart Confirmation Dialog */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#eee4d6] bg-[#fffefa] p-6 shadow-2xl">
            <h2
              id="clear-dialog-title"
              className="font-serif text-lg font-bold text-[#24211d]"
            >
              Clear your food bag?
            </h2>
            <p className="mt-2 text-sm text-[#5F584F]">
              Are you sure you want to remove all items from your bag? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-[#ddd3c7] bg-white px-4 py-2 text-xs font-semibold text-[#5F584F] hover:bg-[#fffaf2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="rounded-xl bg-[#c92332] px-4 py-2 text-xs font-bold text-white hover:bg-[#a81725]"
              >
                Yes, Clear Bag
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
