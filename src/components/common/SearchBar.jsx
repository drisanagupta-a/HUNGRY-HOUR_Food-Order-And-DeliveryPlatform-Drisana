import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search for a dish or restaurant",
  compact = false,
}) {
  const clearSearch = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onChange("");
  };

  return (
    <div
      className={`food-search-container${value ? " has-search-value" : ""}`}
    >
      <label className={`food-search${compact ? " food-search-compact" : ""}`}>
        <Search size={19} aria-hidden="true" />
        <span className="visually-hidden">Search food and restaurants</span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        {!compact && !value && <kbd>↵</kbd>}
      </label>
      {value && (
        <button
          className="food-search-clear"
          type="button"
          onClick={clearSearch}
          aria-label="Clear search"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}