import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, MapPin, PackageCheck, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import { fetchCustomerOrders } from "../services/orderService.js";
import "../App.css";

export default function OrderHistory({ cartItems = [] }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setErrorMessage("");

    fetchCustomerOrders()
      .then((data) => {
        if (!isCurrent) return;
        setOrders(data);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Could not load order history.",
        );
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  function formatStatus(status) {
    const map = {
      PENDING: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
      CONFIRMED: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200" },
      PREPARING: { label: "Preparing", color: "bg-purple-50 text-purple-700 border-purple-200" },
      READY_FOR_PICKUP: { label: "Ready for Pickup", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-teal-50 text-teal-700 border-teal-200" },
      DELIVERED: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      CANCELLED: { label: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200" },
    };
    return map[status] || { label: status || "Unknown", color: "bg-gray-50 text-gray-700 border-gray-200" };
  }

  function formatDate(isoString) {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  }

  return (
    <div className="food-home order-history-page">
      <Navbar
        favoriteCount={0}
        cartItems={cartItems}
        homePath="/home"
        showSearch={false}
        showFavorites={false}
        showNavigation={false}
        showLogout={true}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#c92332] mb-6 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to restaurants
        </Link>

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#c92332]">
            ACCOUNT ACTIVITY
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24211d]">
            My Orders
          </h1>
        </div>

        {isLoading ? (
          <div className="py-20 text-center" role="status">
            <span
              className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#c92332]/20 border-t-[#c92332] mb-4"
              aria-hidden="true"
            />
            <p className="text-sm text-[#746C61]">Loading your past orders...</p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            <p>{errorMessage}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-12 text-center shadow-sm">
            <PackageCheck
              size={48}
              className="text-[#c92332]/40 mx-auto mb-4"
              aria-hidden="true"
            />
            <h2 className="text-xl font-serif font-semibold text-[#24211d] mb-2">
              No orders placed yet
            </h2>
            <p className="text-sm text-[#746C61] mb-6">
              When you order dishes from local kitchens, they will show up here.
            </p>
            <Link
              to="/home"
              className="rounded-full bg-[#c92332] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a81725]"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = formatStatus(order.status);
              return (
                <article
                  key={order.id}
                  className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee4d6] pb-3 mb-3">
                    <div>
                      <h2 className="text-base font-bold text-[#24211d]">
                        {order.restaurantName || "Hungry Hour Kitchen"}
                      </h2>
                      <p className="text-xs text-[#746C61] flex items-center gap-1 mt-0.5">
                        <Clock3 size={13} />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}
                      >
                        {status.label}
                      </span>
                      <span className="text-base font-extrabold text-[#24211d]">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="mb-3">
                      <ul className="text-xs text-[#5F584F] space-y-1">
                        {order.items.map((line, idx) => (
                          <li key={line.id || idx} className="flex justify-between">
                            <span>
                              {line.quantity} × {line.foodItemName || line.name || "Dish"}
                            </span>
                            <span className="font-medium text-[#24211d]">
                              ₹{line.price ? line.price * line.quantity : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#eee4d6]/60">
                    {order.deliveryAddress ? (
                      <p className="text-xs text-[#746C61] flex items-center gap-1">
                        <MapPin size={13} className="text-[#c92332]" />
                        Delivery to: {order.deliveryAddress}
                      </p>
                    ) : (
                      <span />
                    )}
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-xs font-bold text-[#c92332] hover:underline"
                    >
                      Track Order &rarr;
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
