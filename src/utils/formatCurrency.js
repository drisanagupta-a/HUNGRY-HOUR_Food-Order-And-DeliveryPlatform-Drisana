/**
 * Formats a numeric value into an Indian Rupee currency string.
 * e.g. 249 -> "₹249"
 */
export function formatCurrency(amount) {
  const numeric = typeof amount === "number" ? amount : Number(amount) || 0;
  return `₹${numeric.toLocaleString("en-IN")}`;
}

export default formatCurrency;
