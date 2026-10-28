import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, LogOut, Menu, PackageCheck, ShoppingBag, User, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, logOut } from "../../services/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";
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
  const { user, clearProfile } = useAuth();
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);

  // Close account dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    }

    if (accountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      await logOut();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // already unauthenticated
      } else {
        setLogoutError(
          error instanceof Error
            ? error.message
            : "Unable to log out. Please try again.",
        );
      }
    } finally {
      clearProfile();
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
      setMenuOpen(false);
      setAccountMenuOpen(false);
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
              <ul className="nav-list">
                {user && (
                  <li className="mobile-user-item">
                    <div className="mobile-user-info">
                      <div className="account-avatar-small" aria-hidden="true">
                        {user.fullName ? (
                          user.fullName.charAt(0).toUpperCase()
                        ) : (
                          <User size={14} />
                        )}
                      </div>
                      <div>
                        <span className="mobile-user-label">Hello,</span>
                        <strong className="mobile-user-name">
                          {user.fullName}
                        </strong>
                      </div>
                    </div>
                  </li>
                )}

                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      className="nav-link"
                      href={link.href}
                      aria-current={link.href === "#top" ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}

                {user && (
                  <>
                    <li className="mobile-only-link">
                      <Link
                        to="/profile"
                        className="nav-link mobile-profile-link"
                        onClick={() => setMenuOpen(false)}
                      >
                        <User size={16} aria-hidden="true" />
                        <span>My Profile</span>
                      </Link>
                    </li>
                    <li className="mobile-only-link">
                      <Link
                        to="/orders"
                        className="nav-link mobile-profile-link"
                        onClick={() => setMenuOpen(false)}
                      >
                        <PackageCheck size={16} aria-hidden="true" />
                        <span>My Orders</span>
                      </Link>
                    </li>
                  </>
                )}

                {showLogout && user && (
                  <li className="mobile-only-link">
                    <button
                      className="nav-link nav-logout"
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut size={16} aria-hidden="true" />
                      <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                    </button>
                  </li>
                )}
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
                    <div className="cart-checkout-action" style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #eee4d6" }}>
                      <Link
                        to="/checkout"
                        onClick={() => setCartIsOpen(false)}
                        className="block w-full text-center rounded-full bg-[#c92332] py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#a81725]"
                        style={{ display: "block", width: "100%", textAlign: "center", borderRadius: "9999px", background: "#c92332", padding: "10px 14px", color: "#fff", fontWeight: "700", textDecoration: "none" }}
                      >
                        Checkout • ₹{cartSubtotal}
                      </Link>
                    </div>
                  </>
                )}
                {cartItems.length === 0 && (
                  <p className="cart-note">
                    Add dishes from any restaurant to start your order.
                  </p>
                )}
              </div>
            )}
          </div>

          {showLogout && user ? (
            <div className="account-menu-wrap" ref={accountMenuRef}>
              <button
                className="account-nav-button"
                type="button"
                onClick={() => setAccountMenuOpen((open) => !open)}
                aria-expanded={accountMenuOpen}
                aria-haspopup="true"
                aria-label="Account menu"
              >
                <div className="account-avatar" aria-hidden="true">
                  {user.fullName ? (
                    user.fullName.charAt(0).toUpperCase()
                  ) : (
                    <User size={15} />
                  )}
                </div>
                <span className="account-name">{user.fullName}</span>
                <ChevronDown
                  size={14}
                  className={`account-chevron ${accountMenuOpen ? "is-open" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {accountMenuOpen && (
                <div className="account-dropdown-menu" role="menu">
                  <div className="account-dropdown-header">
                    <p className="account-dropdown-name">{user.fullName}</p>
                    {user.role && (
                      <span className="account-dropdown-role">{user.role}</span>
                    )}
                  </div>
                  <div className="account-dropdown-divider" />
                  <Link
                    to="/profile"
                    className="account-dropdown-item"
                    role="menuitem"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <User size={16} aria-hidden="true" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    className="account-dropdown-item"
                    role="menuitem"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <PackageCheck size={16} aria-hidden="true" />
                    <span>My Orders</span>
                  </Link>
                  <div className="account-dropdown-divider" />
                  <button
                    type="button"
                    className="account-dropdown-item account-logout-item"
                    role="menuitem"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                  >
                    <LogOut size={16} aria-hidden="true" />
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            showLogout && (
              <button
                className="profile-link"
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut size={18} aria-hidden="true" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </button>
            )
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