import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search for a dish or restaurant",
  compact = false,
}) {
  return (
    <label className={`food-search${compact ? " food-search-compact" : ""}`}>
      <Search size={19} aria-hidden="true" />
      <span className="visually-hidden">Search food and restaurants</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {!compact && <kbd>↵</kbd>}
    </label>
  );
}