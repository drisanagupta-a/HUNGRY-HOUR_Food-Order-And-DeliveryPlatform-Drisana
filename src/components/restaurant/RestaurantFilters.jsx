import {
  Check,
  ChevronDown,
  Clock,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

/**
 * Filter and search controls for the HUNGRY HOUR restaurant listing page.
 */
export default function RestaurantFilters({
  searchText = "",
  onSearchChange = () => {},
  selectedCuisine = "All",
  onCuisineChange = () => {},
  availableCuisines = [],
  openNow = false,
  onOpenNowChange = () => {},
  sortBy = "recommended",
  onSortChange = () => {},
  sortOptions = [],
  onClearFilters = () => {},
  onClearSearch = () => {},
  onClearCuisine = () => {},
  onClearOpenNow = () => {},
  onClearCategory = () => {},
  onClearFavorites = () => {},
  selectedCategory = "All",
  showFavorites = false,
  totalCount = 0,
  isLoading = false,
}) {
  const hasActiveFilters = Boolean(
    searchText.trim() ||
      selectedCuisine !== "All" ||
      openNow ||
      selectedCategory !== "All" ||
      showFavorites ||
      sortBy !== "recommended",
  );

  return (
    <section
      className="restaurant-filters-section mb-6"
      aria-label="Restaurant filters and search"
    >
      {/* Primary Filter Bar */}
      <div className="bg-[#fffefa] border border-[#eee4d6] rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Working Search Field */}
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#746C61] pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search restaurants by name..."
              className="w-full bg-[#fffaf2] border border-[#e8dfd2] rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#24211d] placeholder-[#746C61]/70 focus:outline-none focus:border-[#c92332] focus:ring-2 focus:ring-[#c92332]/15 transition-all"
              aria-label="Search restaurants by name"
            />
            {searchText && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#746C61] hover:text-[#c92332] p-0.5 rounded-full hover:bg-[#eee4d6]/60 transition-colors"
                aria-label="Clear search input"
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Controls Group: Cuisine + Open Now + Sort + Clear */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Open Now Filter (Backend-supported) */}
            <button
              type="button"
              onClick={() => onOpenNowChange(!openNow)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                openNow
                  ? "bg-[#c92332] text-white border-[#c92332] shadow-xs"
                  : "bg-[#fffaf2] text-[#746C61] border-[#e8dfd2] hover:border-[#c92332]/40"
              }`}
              aria-pressed={openNow}
              title={openNow ? "Showing only open restaurants" : "Filter by restaurants open now"}
            >
              <Clock
                size={14}
                className={openNow ? "text-white" : "text-[#746C61]"}
                aria-hidden="true"
              />
              <span>Open Now</span>
              {openNow && <Check size={13} className="ml-0.5" aria-hidden="true" />}
            </button>

            {/* Cuisine Filter (Real backend response data) */}
            <div className="relative min-w-[130px] sm:min-w-[145px]">
              <select
                value={selectedCuisine}
                onChange={(e) => onCuisineChange(e.target.value)}
                className={`w-full appearance-none rounded-xl px-3 pr-8 py-2 text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c92332]/15 transition-all ${
                  selectedCuisine !== "All"
                    ? "bg-[#c92332]/10 border-[#c92332] text-[#c92332]"
                    : "bg-[#fffaf2] border-[#e8dfd2] text-[#24211d] hover:border-[#c92332]/40"
                }`}
                aria-label="Filter restaurants by cuisine"
              >
                <option value="All">All Cuisines</option>
                {availableCuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  selectedCuisine !== "All" ? "text-[#c92332]" : "text-[#746C61]"
                }`}
                aria-hidden="true"
              />
            </div>

            {/* Sort Dropdown */}
            {sortOptions.length > 0 && (
              <div className="relative min-w-[130px] sm:min-w-[150px]">
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="w-full appearance-none bg-[#fffaf2] border border-[#e8dfd2] rounded-xl px-3 pr-8 py-2 text-xs font-semibold text-[#24211d] hover:border-[#c92332]/40 focus:outline-none focus:border-[#c92332] focus:ring-2 focus:ring-[#c92332]/15 transition-all cursor-pointer"
                  aria-label="Sort restaurants"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#746C61] pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            )}

            {/* Clear All Filters Option */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#c92332] hover:bg-[#c92332]/10 rounded-xl border border-[#c92332]/30 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw size={12} aria-hidden="true" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Summary & Active Filter Chips */}
        <div className="mt-3 pt-3 border-t border-[#eee4d6] flex flex-wrap items-center justify-between gap-2 text-xs text-[#746C61]">
          {/* Result Count */}
          <div className="flex items-center gap-1.5" aria-live="polite">
            <SlidersHorizontal size={13} className="text-[#c92332]" aria-hidden="true" />
            <span>
              <strong>{isLoading ? "Searching..." : totalCount}</strong>{" "}
              {totalCount === 1 ? "restaurant" : "restaurants"} found
            </span>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#746C61]/80 mr-0.5">Active filters:</span>

              {searchText.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f3eae0] text-[#24211d] text-[11px] font-medium border border-[#e4d6c5]">
                  <span>Name: &ldquo;{searchText.trim()}&rdquo;</span>
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="hover:text-[#c92332] focus:outline-none"
                    aria-label="Remove search filter"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}

              {openNow && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                  <span>Open Now</span>
                  <button
                    type="button"
                    onClick={onClearOpenNow}
                    className="hover:text-emerald-950 focus:outline-none"
                    aria-label="Remove Open Now filter"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}

              {selectedCuisine !== "All" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f3eae0] text-[#24211d] text-[11px] font-medium border border-[#e4d6c5]">
                  <span>Cuisine: {selectedCuisine} <em className="not-italic text-[#746C61]">(Backend filter pending)</em></span>
                  <button
                    type="button"
                    onClick={onClearCuisine}
                    className="hover:text-[#c92332] focus:outline-none"
                    aria-label="Remove cuisine filter"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}

              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f3eae0] text-[#24211d] text-[11px] font-medium border border-[#e4d6c5]">
                  <span>Category: {selectedCategory} <em className="not-italic text-[#746C61]">(Backend filter pending)</em></span>
                  <button
                    type="button"
                    onClick={onClearCategory}
                    className="hover:text-[#c92332] focus:outline-none"
                    aria-label="Remove category filter"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}

              {sortBy !== "recommended" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f3eae0] text-[#24211d] text-[11px] font-medium border border-[#e4d6c5]">
                  <span>Sort: {sortOptions.find((o) => o.value === sortBy)?.label || sortBy} <em className="not-italic text-[#746C61]">(Backend sort pending)</em></span>
                  <button
                    type="button"
                    onClick={() => onSortChange("recommended")}
                    className="hover:text-[#c92332] focus:outline-none"
                    aria-label="Remove sort"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}

              {showFavorites && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-[#c92332] text-[11px] font-medium border border-rose-200">
                  <span>Favorites Only</span>
                  <button
                    type="button"
                    onClick={onClearFavorites}
                    className="hover:text-rose-950 focus:outline-none"
                    aria-label="Remove favorites filter"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={onClearFilters}
                className="text-[11px] text-[#c92332] hover:underline font-semibold ml-1 cursor-pointer"
              >
                Reset all
              </button>
            </div>
          )}

          {(selectedCuisine !== "All" ||
            selectedCategory !== "All" ||
            sortBy !== "recommended") && (
            <div className="w-full mt-1.5 text-[11px] text-[#746C61] bg-[#f9f4ec] border border-[#eee4d6] rounded-lg px-2.5 py-1">
              <strong>Backend notice:</strong> Cuisine, category, and sorting parameters are not yet supported by <code>GET /api/customer/restaurants</code>. Only <code>q</code> (search) and <code>open</code> (status) are processed by the backend.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
