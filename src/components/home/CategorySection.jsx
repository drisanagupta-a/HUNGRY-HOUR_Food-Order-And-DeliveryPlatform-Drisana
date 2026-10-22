export default function CategorySection({
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  return (
    <section className="home-section category-section" aria-labelledby="category-title">
      <div className="section-heading category-heading">
        <div>
          <p className="section-kicker">WHAT SOUNDS GOOD?</p>
          <h2 id="category-title">A craving for every mood.</h2>
        </div>
        <p className="section-aside">Pick a little something to get started</p>
      </div>
      <div className="category-list" role="group" aria-label="Filter by food type">
        <button
          className={`category-card${selectedCategory === "All" ? " category-card-active" : ""}`}
          type="button"
          onClick={() => onSelectCategory("All")}
          aria-pressed={selectedCategory === "All"}
        >
          <span className="category-icon">✦</span>
          <span>Everything</span>
        </button>
        {categories.map((category) => (
          <button
            className={`category-card${selectedCategory === category.name ? " category-card-active" : ""}`}
            key={category.name}
            type="button"
            onClick={() => onSelectCategory(category.name)}
            aria-pressed={selectedCategory === category.name}
          >
            <span className="category-icon" aria-hidden="true">
              {category.icon}
            </span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}