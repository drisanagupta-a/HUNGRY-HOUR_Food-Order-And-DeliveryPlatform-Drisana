import { Link } from "react-router-dom";

export default function OrderSummary({
  subtotal = 0,
  deliveryFee = 0,
  actionButton,
  restaurantName,
}) {
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-[#fffefa] border border-[#eee6dc] rounded-2xl p-6 shadow-sm sticky top-6">
      <h2 className="text-lg font-serif font-bold text-[#24211d] mb-4">
        Order Summary
      </h2>

      {restaurantName && (
        <p className="text-xs text-[#746C61] mb-3 pb-3 border-b border-[#eee4d6]">
          Ordering from: <strong className="text-[#24211d]">{restaurantName}</strong>
        </p>
      )}

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-[#5F584F]">
          <span>Item Subtotal</span>
          <span className="font-semibold text-[#24211d]">₹{subtotal}</span>
        </div>

        <div className="flex justify-between text-[#5F584F]">
          <span>Delivery Fee</span>
          <span className="font-semibold text-emerald-700">
            {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
          </span>
        </div>

        <div className="border-t border-[#eee4d6] pt-3 flex justify-between items-center text-base">
          <span className="font-bold text-[#24211d]">Total to pay</span>
          <span className="text-xl font-extrabold text-[#c92332]">
            ₹{total}
          </span>
        </div>
      </div>

      {actionButton && <div className="mt-6">{actionButton}</div>}
    </div>
  );
}
