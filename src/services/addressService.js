import { requestJson } from "./authService.js";
import { extractArray } from "./restaurantService.js";

/**
 * Fetches all saved delivery addresses for the authenticated customer.
 * Endpoint: GET /api/customer/addresses
 */
export async function fetchCustomerAddresses() {
  const data = await requestJson("/api/customer/addresses", "GET", undefined, true);
  return extractArray(data);
}

/**
 * Creates a new delivery address for the authenticated customer.
 * Endpoint: POST /api/customer/addresses
 * Body: DeliveryAddressRequest
 */
export async function createCustomerAddress(addressData) {
  return requestJson("/api/customer/addresses", "POST", addressData, true);
}

/**
 * Fetches a single delivery address by its ID.
 * Endpoint: GET /api/customer/addresses/{id}
 */
export async function getCustomerAddress(addressId) {
  if (!addressId) {
    throw new Error("Address ID is required.");
  }
  return requestJson(
    `/api/customer/addresses/${encodeURIComponent(addressId)}`,
    "GET",
    undefined,
    true,
  );
}

/**
 * Updates an existing delivery address.
 * Endpoint: PUT /api/customer/addresses/{id}
 * Body: DeliveryAddressRequest
 */
export async function updateCustomerAddress(addressId, addressData) {
  if (!addressId) {
    throw new Error("Address ID is required to update an address.");
  }
  return requestJson(
    `/api/customer/addresses/${encodeURIComponent(addressId)}`,
    "PUT",
    addressData,
    true,
  );
}

/**
 * Deletes an existing delivery address.
 * Endpoint: DELETE /api/customer/addresses/{id}
 */
export async function deleteCustomerAddress(addressId) {
  if (!addressId) {
    throw new Error("Address ID is required to delete an address.");
  }
  return requestJson(
    `/api/customer/addresses/${encodeURIComponent(addressId)}`,
    "DELETE",
    undefined,
    true,
  );
}

/**
 * Sets a specific address as the default delivery address.
 * Endpoint: PATCH /api/customer/addresses/{id}/default
 */
export async function setDefaultCustomerAddress(addressId) {
  if (!addressId) {
    throw new Error("Address ID is required to set default address.");
  }
  return requestJson(
    `/api/customer/addresses/${encodeURIComponent(addressId)}/default`,
    "PATCH",
    undefined,
    true,
  );
}
