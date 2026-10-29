import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  Utensils,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import { fetchOrderById } from "../services/orderService.js";
import "../App.css";

const POLL_INTERVAL_MS = 20_000; // 20 seconds automatic refresh interval

const ORDER_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Package },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PREPARING", label: "Kitchen Preparing", icon: Utensils },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

function getStepIndex(status) {
  if (status === "READY_FOR_PICKUP") return 2; // Part of preparation
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function OrderTracking({ cartItems = [] }) {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isRequestInProgressRef = useRef(false);
  const isMountedRef = useRef(true);

  function loadOrder(refresh = false) {
    if (!orderId) return;

    // Prevent overlapping requests
    if (isRequestInProgressRef.current) return;
    isRequestInProgressRef.current = true;

    if (refresh) {
      setIsRefreshing(true);
    } else if (!order) {
      setIsLoading(true);
    }
    setErrorMessage("");

    fetchOrderById(orderId)
      .then((data) => {
        if (!isMountedRef.current) return;
        setOrder(data);
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        setOrder((currentOrder) => {
          // If order is already loaded, handle temporary failure gracefully without wiping order view
          if (!currentOrder) {
            setErrorMessage(
              err instanceof Error
                ? err.message
                : "Could not load order details.",
            );
          } else {
            console.warn("Background order status update failed:", err);
          }
          return currentOrder;
        });
      })
      .finally(() => {
        isRequestInProgressRef.current = false;
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });
  }

  // Initial load and cleanup on orderId change or unmount
  useEffect(() => {
    isMountedRef.current = true;
    loadOrder(false);

    return () => {
      isMountedRef.current = false;
      isRequestInProgressRef.current = false;
    };
  }, [orderId]);

  const isOrderActive =
    order !== null &&
    order.status !== "DELIVERED" &&
    order.status !== "CANCELLED";

  // Automatic polling every 20 seconds while order is active
  useEffect(() => {
    if (!orderId || !isOrderActive) {
      return;
    }

    const intervalId = setInterval(() => {
      loadOrder(false);
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [orderId, isOrderActive]);

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

  const currentStep = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === "CANCELLED";
  const targetPercent = Math.min(100, Math.max(0, (currentStep / 4) * 100));
  const [animatedWidth, setAnimatedWidth] = useState("0%");

  useEffect(() => {
    if (!order) {
      setAnimatedWidth("0%");
      return;
    }
    // Animate the red progress indicator from left to right on load/update
    const timer = setTimeout(() => {
      setAnimatedWidth(`${targetPercent}%`);
    }, 150);

    return () => clearTimeout(timer);
  }, [order, targetPercent]);

  return (
    <div className="food-home order-tracking-page">
      <Navbar
        favoriteCount={0}
        cartItems={cartItems}
        homePath="/home"
        showSearch={false}
        showFavorites={false}
        showNavigation={false}
        showLogout={true}
      />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#c92332] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to my orders
          </Link>

          {order && (
            <button
              type="button"
              onClick={() => loadOrder(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#eee4d6] bg-white px-3 py-1.5 text-xs font-semibold text-[#5F584F] shadow-sm hover:bg-[#fffaf2] disabled:opacity-50"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Updating..." : "Refresh Status"}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 text-center" role="status">
            <span
              className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#c92332]/20 border-t-[#c92332] mb-4"
              aria-hidden="true"
            />
            <p className="text-sm text-[#746C61]">Fetching live order updates...</p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            <p className="font-semibold mb-2">Error Loading Order</p>
            <p className="text-xs">{errorMessage}</p>
            <Link
              to="/orders"
              className="inline-block mt-4 rounded-full bg-[#c92332] px-5 py-2 text-xs font-bold text-white"
            >
              Return to Orders
            </Link>
          </div>
        ) : !order ? (
          <div className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-8 text-center">
            <p className="text-sm text-[#746C61]">Order not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <section className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#c92332]">
                    LIVE ORDER STATUS
                  </p>
                  <h1 className="text-2xl font-serif font-bold text-[#24211d]">
                    {order.restaurantName || "Hungry Hour Kitchen"}
                  </h1>
                  <p className="text-xs text-[#746C61] mt-1">
                    Order ID: <span className="font-mono font-semibold text-[#24211d]">{order.id}</span>
                  </p>
                  <p className="text-xs text-[#746C61] flex items-center gap-1 mt-0.5">
                    <Clock3 size={13} />
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      isCancelled
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {order.status}
                  </span>
                  <p className="text-lg font-extrabold text-[#c92332] mt-1">
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>

              {/* Progress Stepper with Animated Red Progress Indicator */}
              {isCancelled ? (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-center text-xs text-rose-700 font-medium">
                  This order was cancelled.
                </div>
              ) : (
                <div className="pt-5 border-t border-[#eee4d6]">
                  <div className="relative">
                    {/* Background track line */}
                    <div
                      className="absolute top-[18px] sm:top-[20px] left-[10%] right-[10%] h-[3px] bg-[#eee4d6] rounded-full overflow-hidden pointer-events-none"
                      aria-hidden="true"
                    >
                      {/* Animated red active progress bar */}
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out hh-track-bar ${
                          !isCancelled && currentStep < 4 ? "hh-anim-track" : ""
                        }`}
                        style={{ width: animatedWidth }}
                      />
                    </div>

                    {/* Timeline step items */}
                    <div className="relative z-10 grid grid-cols-5 gap-1 text-center">
                      {ORDER_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isComplete = idx < currentStep || currentStep === 4;
                        const isCurrentStep = idx === currentStep && currentStep < 4;
                        const isUpcoming = idx > currentStep && !isCancelled;

                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 mb-1.5 relative ${
                                isComplete
                                  ? "bg-[#c92332] text-white shadow-sm"
                                  : isCurrentStep
                                  ? "bg-[#c92332] text-white shadow-md ring-4 ring-[#c92332]/25"
                                  : "bg-[#fffefa] border-2 border-[#eee4d6] text-[#746C61]/70"
                              } ${isUpcoming ? "hh-anim-upcoming" : ""}`}
                              style={
                                isUpcoming
                                  ? { animationDelay: `${(idx - currentStep) * 600}ms` }
                                  : undefined
                              }
                            >
                              {isCurrentStep && !isCancelled && (
                                <span
                                  className="hh-anim-ping absolute -inset-1 rounded-full bg-[#c92332]/35 animate-ping pointer-events-none"
                                  style={{ animationDuration: "2.2s" }}
                                  aria-hidden="true"
                                />
                              )}
                              <Icon size={16} className="relative z-10" />
                            </div>
                            <span
                              className={`text-[10px] sm:text-xs leading-tight font-semibold transition-colors ${
                                isComplete
                                  ? "text-[#24211d]"
                                  : isCurrentStep
                                  ? "text-[#c92332] font-bold"
                                  : "text-[#746C61]/70"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Decorative Animation Keyframes & Accessibility */}
              <style>{`
                @keyframes hhTrackWave {
                  0% { background-position: 100% 0; }
                  100% { background-position: -100% 0; }
                }

                @keyframes hhUpcomingPulse {
                  0%, 100% {
                    border-color: #eee4d6;
                    color: #9c9386;
                    box-shadow: 0 0 0 0 rgba(201, 35, 50, 0);
                  }
                  50% {
                    border-color: rgba(201, 35, 50, 0.45);
                    color: #c92332;
                    box-shadow: 0 0 10px rgba(201, 35, 50, 0.2);
                  }
                }

                .hh-track-bar {
                  background: linear-gradient(90deg, #c92332 0%, #ff4d5e 50%, #c92332 100%);
                  background-size: 200% 100%;
                }

                .hh-anim-track {
                  animation: hhTrackWave 2.8s linear infinite;
                }

                .hh-anim-upcoming {
                  animation: hhUpcomingPulse 3s ease-in-out infinite;
                }

                @media (prefers-reduced-motion: reduce) {
                  .hh-anim-track,
                  .hh-anim-ping,
                  .hh-anim-upcoming,
                  .hh-track-bar {
                    animation: none !important;
                    transition: none !important;
                  }
                }
              `}</style>

              {/* Preparation time estimate if provided by backend */}
              {order.estimatedPreparationMinutes && (
                <div className="mt-4 pt-4 border-t border-[#eee4d6] flex items-center gap-2 text-xs text-[#746C61]">
                  <Clock3 size={14} className="text-[#c92332]" />
                  <span>
                    Estimated preparation:{" "}
                    <strong>{order.estimatedPreparationMinutes} minutes</strong>
                  </span>
                </div>
              )}
            </section>

            {/* Delivery Details */}
            <section className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-serif font-bold text-[#24211d] flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-[#c92332]" />
                Delivery Details
              </h2>
              <p className="text-sm text-[#24211d] font-medium">
                {order.deliveryAddress}
              </p>

              {order.customerNote && (
                <p className="text-xs text-[#746C61] mt-2 italic">
                  Note: &quot;{order.customerNote}&quot;
                </p>
              )}

              {/* Google Maps Directions URL provided by backend */}
              {order.googleMapsDirectionsUrl && (
                <div className="mt-4 pt-3 border-t border-[#eee4d6]">
                  <a
                    href={order.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c92332] hover:underline"
                  >
                    <ExternalLink size={14} />
                    View Delivery Route on Google Maps
                  </a>
                </div>
              )}
            </section>

            {/* Order Items */}
            <section className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-serif font-bold text-[#24211d] mb-3">
                Items in This Order
              </h2>

              {Array.isArray(order.items) && order.items.length > 0 ? (
                <ul className="divide-y divide-[#eee4d6] text-sm">
                  {order.items.map((line, idx) => (
                    <li key={line.id || idx} className="py-2.5 flex justify-between">
                      <div>
                        <p className="font-semibold text-[#24211d]">
                          {line.foodItemName || line.name || "Dish"}
                        </p>
                        <p className="text-xs text-[#746C61]">
                          Quantity: {line.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-[#24211d]">
                        {line.price ? `₹${line.price * line.quantity}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#746C61]">Item details not available.</p>
              )}

              <div className="border-t border-[#eee4d6] mt-4 pt-4 flex justify-between items-center text-sm">
                <span className="font-bold text-[#24211d]">Total Amount</span>
                <span className="text-lg font-bold text-[#c92332]">
                  ₹{order.totalAmount}
                </span>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
