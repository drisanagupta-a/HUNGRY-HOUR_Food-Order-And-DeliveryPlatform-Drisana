import { Minus, Plus, Trash2, Utensils } from "lucide-react";
import { useState } from "react";

export default function CartItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  readOnly = false,
}) {
  const [imgError, setImgError] = useState(false);
  const itemTotal = (item.price || 0) * (item.quantity || 1);
  const image = item.image || item.imageUrl;

  return (
    <article className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-[#eee4d6] last:border-b-0">
      {/* Left: Thumbnail & Details */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="w-16 h-16 rounded-xl bg-[#fffaf2] border border-[#eee4d6] overflow-hidden shrink-0 flex items-center justify-center">
          {image && !imgError ? (
            <img
              src={image}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <Utensils size={22} className="text-[#c92332]/40" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-[#24211d] truncate">
            {item.name}
          </h3>
          <p className="text-xs text-[#746C61] mt-0.5">
            ₹{item.price} each
          </p>
        </div>
      </div>

      {/* Right: Quantity controls, subtotal, and remove */}
      <div className="flex items-center justify-between sm:justify-end gap-5">
        {!readOnly ? (
          <div className="flex items-center gap-2 border border-[#eee4d6] bg-[#fffefa] rounded-full px-2 py-1 shadow-sm">
            <button
              type="button"
              onClick={() => onDecrement?.(item.id)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#5F584F] hover:bg-[#f3eae0] hover:text-[#24211d] transition"
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus size={13} />
            </button>
            <span className="w-6 text-center text-xs font-bold text-[#24211d]">
              {item.quantity || 1}
            </span>
            <button
              type="button"
              onClick={() => onIncrement?.(item.id)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#5F584F] hover:bg-[#f3eae0] hover:text-[#24211d] transition"
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus size={13} />
            </button>
          </div>
        ) : (
          <span className="text-xs font-semibold text-[#746C61]">
            Qty: {item.quantity || 1}
          </span>
        )}

        <div className="text-right min-w-[70px]">
          <span className="text-sm sm:text-base font-extrabold text-[#24211d]">
            ₹{itemTotal}
          </span>
        </div>

        {!readOnly && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-[#746C61] hover:text-[#c92332] rounded-lg transition"
            aria-label={`Remove ${item.name} from cart`}
            title="Remove item"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </article>
  );
}
