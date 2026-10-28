import { requestJson } from "./authService.js";
import { extractArray } from "./restaurantService.js";

/**
 * Places a customer order.
 * Endpoint: POST /api/customer/orders?paymentMethod=CASH_ON_DELIVERY (or RAZORPAY)
 * Body: { restaurantId, deliveryAddress, customerNote, items: [{ foodItemId, quantity }] }
 */
export async function placeOrder({
  restaurantId,
  deliveryAddress,
  customerNote = "",
  items = [],
  paymentMethod = "CASH_ON_DELIVERY",
}) {
  if (!restaurantId) {
    throw new Error("Restaurant ID is required to place an order.");
  }
  if (!deliveryAddress || !deliveryAddress.trim()) {
    throw new Error("Delivery address is required.");
  }
  if (!items || items.length === 0) {
    throw new Error("Cannot place an order with an empty cart.");
  }

  const orderLines = items.map((item) => ({
    foodItemId: item.id,
    quantity: Number(item.quantity) || 1,
  }));

  const payload = {
    restaurantId,
    deliveryAddress: deliveryAddress.trim(),
    customerNote: customerNote.trim() || undefined,
    items: orderLines,
  };

  const queryString = `?paymentMethod=${encodeURIComponent(paymentMethod)}`;
  return requestJson(
    `/api/customer/orders${queryString}`,
    "POST",
    payload,
    true,
  );
}

/**
 * Fetches the authenticated customer's order history.
 * Endpoint: GET /api/customer/orders
 */
export async function fetchCustomerOrders() {
  const data = await requestJson("/api/customer/orders", "GET", undefined, true);
  return extractArray(data);
}

/**
 * Fetches order details for a specific order.
 * Endpoint: GET /api/customer/orders/{orderId}
 */
export async function fetchOrderById(orderId) {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }
  return requestJson(
    `/api/customer/orders/${encodeURIComponent(orderId)}`,
    "GET",
    undefined,
    true,
  );
}

/**
 * Fetches the authenticated customer's saved delivery addresses.
 * Endpoint: GET /api/customer/addresses
 */
export async function fetchCustomerAddresses() {
  const data = await requestJson("/api/customer/addresses", "GET", undefined, true);
  return extractArray(data);
}

/**
 * Saves a new delivery address for the authenticated customer.
 * Endpoint: POST /api/customer/addresses
 */
export async function createCustomerAddress(addressData) {
  return requestJson("/api/customer/addresses", "POST", addressData, true);
}

/**
 * Creates a Razorpay payment order for an existing order.
 * Endpoint: POST /api/customer/orders/{orderId}/payment
 * Returns PaymentOrderResponse: { orderId, amount, currency, razorpayOrderId, razorpayKeyId, ... }
 */
export async function createPaymentOrder(orderId) {
  if (!orderId) {
    throw new Error("Order ID is required to create a payment order.");
  }
  return requestJson(
    `/api/customer/orders/${encodeURIComponent(orderId)}/payment`,
    "POST",
    undefined,
    true,
  );
}

/**
 * Verifies the Razorpay payment signature and updates order payment status to PAID.
 * Endpoint: POST /api/customer/orders/{orderId}/payment/verify
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
export async function verifyPayment(
  orderId,
  { razorpayOrderId, razorpayPaymentId, razorpaySignature },
) {
  if (!orderId) {
    throw new Error("Order ID is required to verify payment.");
  }
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new Error("Incomplete payment credentials received from gateway.");
  }
  return requestJson(
    `/api/customer/orders/${encodeURIComponent(orderId)}/payment/verify`,
    "POST",
    {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    },
    true,
  );
}

/**
 * Dynamically loads the official Razorpay Checkout SDK.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
