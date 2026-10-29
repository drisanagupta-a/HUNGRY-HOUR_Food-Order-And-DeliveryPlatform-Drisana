import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import {
  createCustomerAddress,
  createPaymentOrder,
  fetchCustomerAddresses,
  loadRazorpayScript,
  placeOrder,
  verifyPayment,
} from "../services/orderService.js";
import "../App.css";

const MAX_ADDRESS_LENGTH = 500;
const MIN_ADDRESS_LENGTH = 10;
const MAX_NOTE_LENGTH = 500;
const MAX_LABEL_LENGTH = 50;
const SUPPORTED_PAYMENT_METHODS = ["CASH_ON_DELIVERY", "RAZORPAY"];

/**
 * Validates delivery address format and textual sanity.
 * Note: Performs client-side structural and pattern validation (rejecting empty/whitespace,
 * excessive repetitions, punctuation spam, and keyboard mashing), but does NOT claim
 * geographical existence or delivery serviceable-radius verification, which requires
 * a dedicated backend geocoding service.
 */
function validateDeliveryAddress(address) {
  if (!address || typeof address !== "string") {
    return "Delivery address is required.";
  }

  const trimmed = address.trim();

  // 1. Mandatory & non-empty
  if (!trimmed) {
    return "Delivery address cannot be empty or only spaces.";
  }

  // 2. Length bounds (minimum 10 chars, maximum 500 chars)
  if (trimmed.length < MIN_ADDRESS_LENGTH) {
    return `Please enter a complete address with flat/house number and street name (at least ${MIN_ADDRESS_LENGTH} characters).`;
  }

  if (trimmed.length > MAX_ADDRESS_LENGTH) {
    return `Address cannot exceed ${MAX_ADDRESS_LENGTH} characters.`;
  }

  // 3. Reject excessive character repetitions (e.g. 'aaaa', '1111')
  if (/(.)\1{3,}/.test(trimmed)) {
    return "Address contains invalid repeated characters. Please enter a genuine delivery address.";
  }

  // 4. Repeated punctuation / symbol sequences (e.g. ',,,,,,', '.....', '-----')
  if (/([,.\-#/()':;&!@$%^*+=|~`])\1{2,}/.test(trimmed)) {
    return "Address contains repeated punctuation marks. Please enter a clean street address.";
  }

  // 5. Minimum unique character diversity (rejects '1212121212', 'ababababab')
  const stripped = trimmed.replace(/\s+/g, "").toLowerCase();
  const uniqueChars = new Set(stripped);
  if (stripped.length >= 10 && uniqueChars.size < 5) {
    return "Please provide more specific street, building, or area details.";
  }

  // 6. Letters / Language content requirement (must contain at least 6 letters/script characters, supports English & Devanagari/Indic)
  const letters = trimmed.match(/[\p{L}\p{M}]/gu) || [];
  if (letters.length < 6) {
    return "Address must include street, building, or locality names, not just numbers or symbols.";
  }

  // 7. Structure: Must consist of at least 2 distinct words/parts and at least one word >= 3 chars
  const words = trimmed.split(/[\s,./#-]+/).filter((w) => w.trim().length > 0);
  if (words.length < 2 || !words.some((w) => w.length >= 3)) {
    return "Please include both your building/flat number and street or area name.";
  }

  // 8. Keyboard mashing row / walk detection (e.g. 'asdfgh', 'qwerty', 'zxcvbn')
  const keyboardWalks = [
    /(qwer|asdf|zxcv|poiuy|lkjh|mnbv)/i,
    /qazwsx/i,
    /123456/i,
    /abcdef/i,
    /qwe[\s_-]*rty/i,
    /asd[\s_-]*fgh/i,
  ];
  for (const pattern of keyboardWalks) {
    if (pattern.test(trimmed)) {
      return "Address contains an invalid pattern. Please provide your actual delivery address.";
    }
  }

  // 9. Unpronounceable Latin words (consonant mash like 'dfghjkl' or 'zxcvbn')
  for (const word of words) {
    const latinLetters = word.replace(/[^a-zA-Z]/g, "");
    if (latinLetters.length >= 5) {
      const hasVowel = /[aeiouyAEIOUY]/.test(latinLetters);
      if (!hasVowel) {
        return "Address contains unreadable text. Please enter a valid street address.";
      }
    }
  }

  // 10. Indian PIN code validation (optional: not required, but if entered, must be 6 digits and not begin with 0)
  const pinKeywordMatch = trimmed.match(
    /\b(?:pin|pincode|pin\s*code|postal(?:\s*code)?)\b[\s:#-]*([0-9a-zA-Z]+)/i,
  );
  if (pinKeywordMatch) {
    const pinCandidate = pinKeywordMatch[1];
    if (!/^[1-9]\d{5}$/.test(pinCandidate)) {
      return "Please enter a valid 6-digit Indian PIN code (e.g. 560001; cannot start with 0).";
    }
  } else {
    // If user enters a standalone 6-digit sequence starting with 0, flag invalid PIN
    const standaloneZeroPin = trimmed.match(/\b(0\d{5})\b/);
    if (standaloneZeroPin) {
      return "Indian PIN codes cannot begin with 0. Please verify your 6-digit postal PIN code.";
    }
  }

  // 11. Symbol / Punctuation sanity (permits Unicode letters, marks, numbers, common punctuation)
  const invalidSymbols = trimmed.replace(/[\p{L}\p{M}\p{N}\s,.\-#/()':;&]/gu, "");
  if (invalidSymbols.length > 2) {
    return "Address contains unsupported special symbols.";
  }

  return null;
}

export default function Checkout({ cartItems = [], onClearCart }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cart = useCart();
  const activeCartItems = cart.cartItems?.length ? cart.cartItems : cartItems;
  const { incrementQuantity, decrementQuantity, removeFromCart, clearCart } = cart;
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Payment method: "CASH_ON_DELIVERY" or "RAZORPAY"
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");

  // Track pending online order to prevent duplicate orders upon payment retry
  const [pendingOnlineOrder, setPendingOnlineOrder] = useState(null);

  // Submitting state and step message
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState("");

  // Inline validation errors
  const [addressError, setAddressError] = useState("");
  const [noteError, setNoteError] = useState("");
  const [labelError, setLabelError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Fetch saved customer addresses
  useEffect(() => {
    let isCurrent = true;
    fetchCustomerAddresses()
      .then((addresses) => {
        if (!isCurrent) return;
        setSavedAddresses(addresses);
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        if (defaultAddr && defaultAddr.fullAddress) {
          setDeliveryAddress(defaultAddr.fullAddress);
        }
      })
      .catch(() => {
        // Fallback: user can manually type address
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const cartSubtotal = activeCartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0,
  );

  const restaurantId = activeCartItems[0]?.restaurantId;

  function validateInputs() {
    let isValid = true;
    const trimmedAddress = deliveryAddress.trim();
    const trimmedNote = customerNote.trim();
    const trimmedLabel = addressLabel.trim();

    // Address validation
    const addressErr = validateDeliveryAddress(deliveryAddress);
    if (addressErr) {
      setAddressError(addressErr);
      isValid = false;
    } else {
      setAddressError("");
    }

    // Customer note validation
    if (trimmedNote.length > MAX_NOTE_LENGTH) {
      setNoteError(`Delivery note cannot exceed ${MAX_NOTE_LENGTH} characters.`);
      isValid = false;
    } else {
      setNoteError("");
    }

    // Label validation (if saving address)
    if (saveAddress) {
      if (!trimmedLabel) {
        setLabelError("Address label is required (e.g., Home, Work).");
        isValid = false;
      } else if (trimmedLabel.length > MAX_LABEL_LENGTH) {
        setLabelError(`Label cannot exceed ${MAX_LABEL_LENGTH} characters.`);
        isValid = false;
      } else {
        setLabelError("");
      }
    } else {
      setLabelError("");
    }

    return isValid;
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    setSubmitError("");

    if (activeCartItems.length === 0) {
      setSubmitError("Your bag is empty. Please add dishes before checking out.");
      return;
    }

    if (!restaurantId) {
      setSubmitError("Could not identify the restaurant for this order.");
      return;
    }

    if (!validateInputs()) {
      return;
    }

    if (!SUPPORTED_PAYMENT_METHODS.includes(paymentMethod)) {
      setSubmitError(
        "Selected payment method is not supported. Please select Cash on Delivery or Pay Online (Razorpay).",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Save address if requested
      if (saveAddress) {
        try {
          await createCustomerAddress({
            label: addressLabel.trim(),
            fullAddress: deliveryAddress.trim(),
            deliveryInstructions: customerNote.trim() || undefined,
            isDefault: savedAddresses.length === 0,
          });
        } catch {
          // Non-blocking: order placement takes precedence
        }
      }

      // Branch by payment method
      if (paymentMethod === "CASH_ON_DELIVERY") {
        setSubmittingMessage("Placing Cash on Delivery order...");
        const order = await placeOrder({
          restaurantId,
          deliveryAddress: deliveryAddress.trim(),
          customerNote: customerNote.trim(),
          items: activeCartItems,
          paymentMethod: "CASH_ON_DELIVERY",
        });

        clearCart();
        if (onClearCart) {
          onClearCart();
        }
        setPendingOnlineOrder(null);
        setOrderSuccess(order);
      } else {
        // --- RAZORPAY ONLINE PAYMENT ---
        setSubmittingMessage("Connecting to payment gateway...");
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || typeof window.Razorpay === "undefined") {
          throw new Error(
            "Could not load Razorpay payment gateway script. Please check your internet connection or use Cash on Delivery.",
          );
        }

        let onlineOrder = pendingOnlineOrder;
        if (!onlineOrder) {
          setSubmittingMessage("Creating order...");
          onlineOrder = await placeOrder({
            restaurantId,
            deliveryAddress: deliveryAddress.trim(),
            customerNote: customerNote.trim(),
            items: activeCartItems,
            paymentMethod: "RAZORPAY",
          });
          setPendingOnlineOrder(onlineOrder);
        }

        setSubmittingMessage("Initializing Razorpay session...");
        const paymentData = await createPaymentOrder(onlineOrder.id);

        if (!paymentData || !paymentData.razorpayOrderId || !paymentData.razorpayKeyId) {
          throw new Error(
            paymentData?.message ||
              "The backend did not provide a valid Razorpay Order ID or Key ID. Please verify backend Razorpay configuration or select Cash on Delivery.",
          );
        }

        setSubmittingMessage("Awaiting payment completion...");

        // Calculate amount in paise
        let razorpayAmountInPaise;
        if (typeof paymentData.amount === "number") {
          if (cartSubtotal > 0 && paymentData.amount >= cartSubtotal * 50) {
            razorpayAmountInPaise = Math.round(paymentData.amount);
          } else {
            razorpayAmountInPaise = Math.round(paymentData.amount * 100);
          }
        } else {
          razorpayAmountInPaise = Math.round(cartSubtotal * 100);
        }

        const rzpOptions = {
          key: paymentData.razorpayKeyId,
          amount: razorpayAmountInPaise,
          currency: paymentData.currency || "INR",
          name: "HUNGRY HOUR",
          description: `Order #${(onlineOrder.id || "").slice(0, 8)}`,
          order_id: paymentData.razorpayOrderId,
          prefill: {
            name: user?.fullName || user?.name || "",
            email: user?.email || "",
            contact: user?.phone || user?.phoneNumber || "",
          },
          theme: {
            color: "#c92332",
          },
          handler: async function (response) {
            try {
              setIsSubmitting(true);
              setSubmittingMessage("Verifying payment with backend...");
              setSubmitError("");

              const verifiedOrder = await verifyPayment(onlineOrder.id, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              // Clear the cart ONLY after the backend confirms payment verification
              clearCart();
              if (onClearCart) {
                onClearCart();
              }
              setPendingOnlineOrder(null);
              // Redirect to order tracking
              navigate(`/orders/${verifiedOrder?.id || onlineOrder.id}`);
            } catch (verifyErr) {
              setIsSubmitting(false);
              setSubmittingMessage("");
              const msg =
                verifyErr instanceof Error
                  ? verifyErr.message
                  : "Payment verification failed.";
              setSubmitError(
                `Payment verification failed: ${msg}. If money was deducted, please contact support with Order ID ${onlineOrder.id}.`,
              );
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              setSubmittingMessage("");
              setSubmitError(
                "Payment was not completed (modal closed). Your bag is preserved. You can retry paying online or switch to Cash on Delivery.",
              );
            },
          },
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.on("payment.failed", function (response) {
          setIsSubmitting(false);
          setSubmittingMessage("");
          const reason =
            response?.error?.description ||
            response?.error?.reason ||
            "Payment failed at gateway";
          setSubmitError(
            `Payment failed: ${reason}. Your bag is preserved. You can retry paying online or switch to Cash on Delivery.`,
          );
        });

        rzp.open();
      }
    } catch (err) {
      setIsSubmitting(false);
      setSubmittingMessage("");
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Could not place order. Please try again.",
      );
    } finally {
      if (paymentMethod === "CASH_ON_DELIVERY") {
        setIsSubmitting(false);
        setSubmittingMessage("");
      }
    }
  }

  return (
    <div className="food-home checkout-page">
      <Navbar
        favoriteCount={0}
        cartItems={orderSuccess ? [] : activeCartItems}
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
          Back to browsing
        </Link>

        {orderSuccess ? (
          <div className="bg-[#fffefa] border border-[#eee4d6] rounded-2xl p-8 text-center shadow-sm">
            <CheckCircle2
              size={56}
              className="text-emerald-600 mx-auto mb-4"
              aria-hidden="true"
            />
            <h1 className="text-2xl font-serif font-bold text-[#24211d] mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-sm text-[#746C61] mb-2">
              Order ID:{" "}
              <strong className="text-[#24211d]">
                {orderSuccess.id?.slice(0, 8)}...
              </strong>
            </p>
            <p className="text-sm text-[#746C61] mb-6">
              Status:{" "}
              <span className="font-semibold text-emerald-700 uppercase text-xs px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                {orderSuccess.status || "CONFIRMED"}
              </span>
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to={`/orders/${orderSuccess.id}`}
                className="rounded-full bg-[#c92332] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a81725]"
              >
                Track This Order
              </Link>
              <Link
                to="/orders"
                className="rounded-full border border-[#eee4d6] bg-white px-6 py-2.5 text-sm font-semibold text-[#5F584F] hover:bg-[#fffaf2]"
              >
                All Orders
              </Link>
              <Link
                to="/home"
                className="rounded-full border border-[#eee4d6] bg-white px-6 py-2.5 text-sm font-semibold text-[#5F584F] hover:bg-[#fffaf2]"
              >
                Continue Ordering
              </Link>
            </div>
          </div>
        ) : activeCartItems.length === 0 ? (
          <div className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-12 text-center shadow-sm">
            <ShoppingBag
              size={48}
              className="text-[#c92332]/40 mx-auto mb-4"
              aria-hidden="true"
            />
            <h2 className="text-xl font-serif font-semibold text-[#24211d] mb-2">
              Your Bag is Empty
            </h2>
            <p className="text-sm text-[#746C61] mb-6">
              Browse our neighborhood restaurants to add dishes to your bag.
            </p>
            <Link
              to="/home"
              className="rounded-full bg-[#c92332] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a81725]"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <form onSubmit={handlePlaceOrder} noValidate className="space-y-6">
                <section className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-serif font-bold text-[#24211d] flex items-center gap-2 mb-4">
                    <MapPin size={20} className="text-[#c92332]" />
                    Delivery Address
                  </h2>

                  {savedAddresses.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-[#746C61] mb-2">
                        Choose from saved addresses:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => {
                              setDeliveryAddress(addr.fullAddress);
                              setAddressError("");
                            }}
                            className={`text-xs px-3 py-1.5 rounded-lg border text-left transition ${
                              deliveryAddress === addr.fullAddress
                                ? "border-[#c92332] bg-[#fff4e2] text-[#c92332] font-semibold"
                                : "border-[#eee4d6] bg-white text-[#5F584F] hover:bg-[#fffaf2]"
                            }`}
                          >
                            <strong>{addr.label || "Address"}:</strong>{" "}
                            {addr.fullAddress?.slice(0, 30)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="deliveryAddress" className="block text-xs font-semibold text-[#746C61] mb-1">
                      Full Address <span className="text-[#c92332]">*</span>
                    </label>
                    <textarea
                      id="deliveryAddress"
                      rows={3}
                      maxLength={MAX_ADDRESS_LENGTH}
                      disabled={isSubmitting}
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (addressError) setAddressError("");
                      }}
                      placeholder="Enter street name, building/flat number, landmark, city, and postal code"
                      className={`w-full rounded-xl border p-3 text-sm focus:outline-none ${
                        addressError
                          ? "border-red-500 bg-red-50/30 focus:border-red-600"
                          : "border-[#eee4d6] focus:border-[#c92332]"
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {addressError ? (
                        <p className="text-xs text-red-600 font-medium" role="alert">
                          {addressError}
                        </p>
                      ) : (
                        <span className="text-[11px] text-[#746C61]">
                          Building/flat number, street, locality, and optional 6-digit PIN code.
                        </span>
                      )}
                      <span className="text-[11px] text-[#746C61] shrink-0 ml-2">
                        {deliveryAddress.length}/{MAX_ADDRESS_LENGTH}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8e8579] mt-0.5">
                      Note: Basic format validation is applied locally. Please verify your exact delivery details.
                    </p>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="customerNote" className="block text-xs font-semibold text-[#746C61] mb-1">
                      Delivery instructions or note (optional)
                    </label>
                    <input
                      id="customerNote"
                      type="text"
                      maxLength={MAX_NOTE_LENGTH}
                      disabled={isSubmitting}
                      value={customerNote}
                      onChange={(e) => {
                        setCustomerNote(e.target.value);
                        if (noteError) setNoteError("");
                      }}
                      placeholder="e.g. Ring the bell twice, leave at reception"
                      className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none ${
                        noteError
                          ? "border-red-500 bg-red-50/30 focus:border-red-600"
                          : "border-[#eee4d6] focus:border-[#c92332]"
                      }`}
                    />
                    {noteError && (
                      <p className="text-xs text-red-600 font-medium mt-1" role="alert">
                        {noteError}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#eee4d6]">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#5F584F]">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        disabled={isSubmitting}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="accent-[#c92332] rounded"
                      />
                      Save this address to my profile for future orders
                    </label>

                    {saveAddress && (
                      <div className="mt-3">
                        <label htmlFor="addressLabel" className="block text-xs font-semibold text-[#746C61] mb-1">
                          Address Label (e.g. Home, Work, Apartment)
                        </label>
                        <input
                          id="addressLabel"
                          type="text"
                          maxLength={MAX_LABEL_LENGTH}
                          disabled={isSubmitting}
                          value={addressLabel}
                          onChange={(e) => {
                            setAddressLabel(e.target.value);
                            if (labelError) setLabelError("");
                          }}
                          className={`w-full max-w-xs rounded-xl border px-3 py-2 text-sm focus:outline-none ${
                            labelError
                              ? "border-red-500 bg-red-50/30 focus:border-red-600"
                              : "border-[#eee4d6] focus:border-[#c92332]"
                          }`}
                        />
                        {labelError && (
                          <p className="text-xs text-red-600 font-medium mt-1" role="alert">
                            {labelError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-serif font-bold text-[#24211d] mb-4">
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    {/* Cash on Delivery option */}
                    <label
                      htmlFor="payment-cod"
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        paymentMethod === "CASH_ON_DELIVERY"
                          ? "border-[#c92332] bg-[#fff4e2]/60 shadow-sm"
                          : "border-[#eee4d6] bg-white hover:bg-[#fffaf2]"
                      }`}
                    >
                      <input
                        type="radio"
                        id="payment-cod"
                        name="paymentMethod"
                        value="CASH_ON_DELIVERY"
                        checked={paymentMethod === "CASH_ON_DELIVERY"}
                        disabled={isSubmitting}
                        onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                        className="accent-[#c92332] mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Banknote size={18} className="text-[#c92332]" />
                          <span className="text-sm font-bold text-[#24211d]">
                            Cash on Delivery
                          </span>
                        </div>
                        <p className="text-xs text-[#746C61] mt-0.5">
                          Pay in cash or scan QR upon delivery at your doorstep.
                        </p>
                      </div>
                    </label>

                    {/* Razorpay Online Payment option */}
                    <label
                      htmlFor="payment-razorpay"
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        paymentMethod === "RAZORPAY"
                          ? "border-[#c92332] bg-[#fff4e2]/60 shadow-sm"
                          : "border-[#eee4d6] bg-white hover:bg-[#fffaf2]"
                      }`}
                    >
                      <input
                        type="radio"
                        id="payment-razorpay"
                        name="paymentMethod"
                        value="RAZORPAY"
                        checked={paymentMethod === "RAZORPAY"}
                        disabled={isSubmitting}
                        onChange={() => setPaymentMethod("RAZORPAY")}
                        className="accent-[#c92332] mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard size={18} className="text-[#c92332]" />
                          <span className="text-sm font-bold text-[#24211d]">
                            Pay Online (Razorpay)
                          </span>
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Fast & Secure
                          </span>
                        </div>
                        <p className="text-xs text-[#746C61] mt-0.5">
                          Pay instantly via UPI (GPay, PhonePe, Paytm), Credit / Debit Cards, or NetBanking.
                        </p>
                      </div>
                    </label>
                  </div>

                  {pendingOnlineOrder && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 flex items-center justify-between gap-2">
                      <span>
                        Order <strong>#{pendingOnlineOrder.id?.slice(0, 8)}...</strong> is pending payment. Retrying will pay for this order without creating duplicates.
                      </span>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setPendingOnlineOrder(null);
                          setSubmitError("");
                        }}
                        className="text-amber-900 underline hover:text-amber-950 font-semibold text-[11px] whitespace-nowrap"
                      >
                        Start Fresh Order
                      </button>
                    </div>
                  )}
                </section>

                {submitError && (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2"
                    role="alert"
                  >
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#c92332] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#a81725] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {submittingMessage || "Processing..."}
                    </>
                  ) : paymentMethod === "RAZORPAY" ? (
                    pendingOnlineOrder ? (
                      `Retry Online Payment • ₹${cartSubtotal}`
                    ) : (
                      `Pay Online • ₹${cartSubtotal}`
                    )
                  ) : (
                    `Place Order • ₹${cartSubtotal}`
                  )}
                </button>
              </form>
            </div>

            <div className="md:col-span-1">
              <div className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-6 shadow-sm sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-serif font-bold text-[#24211d]">
                    Order Summary
                  </h2>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/cart"
                      className="text-xs font-semibold text-[#c92332] hover:underline"
                    >
                      Edit in Cart
                    </Link>
                    {!pendingOnlineOrder && !isSubmitting && activeCartItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(true)}
                        className="text-[11px] font-semibold text-[#746C61] hover:text-[#c92332] transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <ul className="divide-y divide-[#eee4d6] text-sm">
                  {activeCartItems.map((item) => (
                    <li key={item.id} className="py-3 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-[#24211d] truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#746C61]">
                          ₹{item.price} each
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {!pendingOnlineOrder && !isSubmitting ? (
                          <div className="flex items-center gap-1.5 border border-[#eee4d6] bg-[#fffefa] rounded-full px-2 py-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => decrementQuantity(item.id)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[#5F584F] hover:bg-[#f3eae0] hover:text-[#24211d] transition"
                              aria-label={`Decrease ${item.name}`}
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-4 text-center text-xs font-bold text-[#24211d]">
                              {item.quantity || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => incrementQuantity(item.id)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[#5F584F] hover:bg-[#f3eae0] hover:text-[#24211d] transition"
                              aria-label={`Increase ${item.name}`}
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-[#746C61]">
                            Qty: {item.quantity || 1}
                          </span>
                        )}

                        <span className="font-bold text-[#24211d] min-w-[50px] text-right">
                          ₹{(item.price || 0) * (item.quantity || 1)}
                        </span>

                        {!pendingOnlineOrder && !isSubmitting && (
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-[#746C61] hover:text-[#c92332] rounded transition"
                            aria-label={`Remove ${item.name}`}
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[#eee4d6] mt-4 pt-4 flex justify-between items-center">
                  <span className="font-bold text-[#24211d]">Total to pay</span>
                  <span className="text-lg font-extrabold text-[#c92332]">
                    ₹{cartSubtotal}
                  </span>
                </div>
              </div>
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
          aria-labelledby="checkout-clear-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#eee4d6] bg-[#fffefa] p-6 shadow-2xl">
            <h2
              id="checkout-clear-title"
              className="font-serif text-lg font-bold text-[#24211d]"
            >
              Clear your food bag?
            </h2>
            <p className="mt-2 text-sm text-[#5F584F]">
              Are you sure you want to remove all dishes from your bag?
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
                onClick={() => {
                  clearCart();
                  if (onClearCart) onClearCart();
                  setPendingOnlineOrder(null);
                  setShowClearConfirm(false);
                }}
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
