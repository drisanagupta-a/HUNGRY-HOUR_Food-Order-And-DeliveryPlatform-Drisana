export default function CategorySection({
  categories = [],
  selectedCategory = "All",
  onSelectCategory,
}) {
  return (
    <section className="food-categories-section" aria-label="Food Categories">
      <div
        className="categories-circular-row"
        role="group"
        aria-label="Filter food categories"
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <button
              key={category.name}
              type="button"
              onClick={() => onSelectCategory?.(category.name)}
              className={`category-circular-card ${isSelected ? "is-active" : ""}`}
              aria-pressed={isSelected}
            >
              <div className="category-circular-icon-wrap" aria-hidden="true">
                <span className="category-emoji-icon">{category.icon}</span>
              </div>
              <span className="category-circular-label">{category.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
