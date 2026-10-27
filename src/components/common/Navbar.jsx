import { useState } from "react";
import { Heart, LogOut, Menu, ShoppingBag, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, logOut } from "../../services/authService.js";
import SearchBar from "./SearchBar.jsx";

const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Restaurants", href: "#restaurants" },
  { label: "Offers", href: "#offers" },
  { label: "Help", href: "#help" },
];

export default function Navbar({
  searchText,
  setSearchText,
  favoriteCount,
  cartItems,
  onFavoritesClick,
  showSearch = true,
  showFavorites = true,
  showNavigation = true,
  showLogout = true,
  homePath = "/home",
}) {
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function getDemoUser() {
    try {
      const session = localStorage.getItem("hh_demo_session");
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.isDemo && parsed?.user) {
          return parsed.user;
        }
      }
    } catch {
      // Invalid JSON in localStorage; no demo user
    }
    return null;
  }

  const demoUser = getDemoUser();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError("");

    // Demo users: clear localStorage only, never contact the backend
    if (demoUser) {
      localStorage.removeItem("hh_demo_session");
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
      setMenuOpen(false);
      return;
    }

    try {
      await logOut();
      navigate("/login", { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      setLogoutError(
        error instanceof Error
          ? error.message
          : "Unable to log out. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to={homePath} aria-label="Hungry Hour home">
          <span className="brand-mark" aria-hidden="true">
            hh
          </span>
          <span className="brand-name">
            HUNGRY <b>HOUR</b>
          </span>
        </Link>

        {showNavigation && (
          <>
            <button
              className="menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>

            <nav
              className={`main-nav ${menuOpen ? "main-nav-open" : ""}`}
              aria-label="Main navigation"
            >
              <button
                className="menu-close"
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
              <ul className="nav-list">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      className="nav-link"
                      href={link.href}
                      aria-current={link.href === "#top" ? "page" : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                {showLogout && demoUser ? (
                  <li>
                    <button
                      className="nav-link nav-logout"
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut
                        ? "Logging out..."
                        : `Log out ${demoUser.name}`}
                    </button>
                  </li>
                ) : null}
              </ul>
            </nav>
          </>
        )}

        {showSearch && (
          <div className="header-search">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Find something delicious"
              compact
            />
          </div>
        )}

        <div className="header-actions">
          {showFavorites && (
            <button
              className="icon-button favorite-nav-button"
              type="button"
              onClick={onFavoritesClick}
              aria-label={`Show favorite restaurants (${favoriteCount})`}
              title="Favorites"
            >
              <Heart size={20} aria-hidden="true" />
              {favoriteCount > 0 && (
                <span className="action-count">{favoriteCount}</span>
              )}
            </button>
          )}
          <div className="cart-menu-wrap">
            <button
              className="icon-button cart-nav-button"
              type="button"
              onClick={() => setCartIsOpen((isOpen) => !isOpen)}
              aria-expanded={cartIsOpen}
              aria-label={`Your bag (${cartCount} items)`}
              title="Your bag"
            >
              <ShoppingBag size={20} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="action-count">{cartCount}</span>
              )}
            </button>
            {cartIsOpen && (
              <div className="cart-popover">
                <div className="cart-popover-heading">
                  <div>
                    <p className="section-kicker">YOUR LITTLE FEAST</p>
                    <h2>Your bag</h2>
                  </div>
                  <button
                    className="popover-close"
                    type="button"
                    onClick={() => setCartIsOpen(false)}
                    aria-label="Close your bag"
                  >
                    <X size={18} />
                  </button>
                </div>
                {cartItems.length === 0 ? (
                  <p className="cart-empty">
                    Your bag is empty. Add a dish that makes you smile.
                  </p>
                ) : (
                  <>
                    <ul className="cart-item-list">
                      {cartItems.map((item) => (
                        <li className="cart-item" key={item.id}>
                          <span>
                            <b>{item.name}</b>
                            <small>
                              {item.quantity} × ₹{item.price}
                            </small>
                          </span>
                          <b>₹{item.price * item.quantity}</b>
                        </li>
                      ))}
                    </ul>
                    <p className="cart-subtotal">
                      <span>Subtotal</span>
                      <strong>₹{cartSubtotal}</strong>
                    </p>
                  </>
                )}
                <p className="cart-note">
                  This sample bag is for browsing only. Checkout isn&apos;t
                  connected.
                </p>
              </div>
            )}
          </div>
          {showLogout && !demoUser && (
            <button
              className="profile-link"
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={18} aria-hidden="true" />
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </button>
          )}
          {demoUser && !menuOpen && showNavigation && (
            <div className="demo-greeting">
              <span className="demo-name">Hello, {demoUser.name}</span>
            </div>
          )}
          {logoutError && (
            <p className="max-w-40 text-xs text-[#D1011F]" role="alert">
              {logoutError}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}