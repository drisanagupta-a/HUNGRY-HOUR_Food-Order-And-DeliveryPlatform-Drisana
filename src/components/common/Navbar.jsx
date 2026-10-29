import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  LogOut,
  MapPin,
  Menu,
  PackageCheck,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, logOut } from "../../services/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import SearchBar from "./SearchBar.jsx";
import hungryHourLogo from "../../assets/Group 9.svg";

export default function Navbar({
  searchText,
  setSearchText,
  favoriteCount = 0,
  cartItems = [],
  onFavoritesClick,
  onToggleSidebar,
  sidebarOpen = false,
  deliveryLocation = "Bengaluru, 560001",
  showSearch = true,
  showFavorites = true,
  showLogout = true,
  homePath = "/home",
}) {
  const { user, clearProfile } = useAuth();
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
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

  const cartContext = useCart();
  const effectiveCartItems = cartItems?.length ? cartItems : (cartContext?.cartItems || []);
  const cartCount = effectiveCartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const cartSubtotal = effectiveCartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
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
      setAccountMenuOpen(false);
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Left Side: Hamburger + Brand Logo + Delivery Location */}
        <div className="header-left-group">
          {onToggleSidebar && (
            <button
              className="sidebar-hamburger-btn"
              type="button"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              onClick={onToggleSidebar}
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          )}

          <Link className="brand" to={homePath} aria-label="Hungry Hour home">
            <img
              src={hungryHourLogo}
              alt="HUNGRY HOUR"
              className="brand-logo-img"
              onError={(e) => {
                // Graceful fallback to text if SVG fails
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = "inline-flex";
              }}
            />
            <span className="brand-fallback-text" style={{ display: "none" }}>
              HUNGRY <b>HOUR</b>
            </span>
          </Link>

          {/* Delivery Location with Location Icon */}
          <div className="header-location-pill" title="Current delivery location">
            <MapPin size={16} className="location-pin" aria-hidden="true" />
            <div className="location-info">
              <span className="location-label">Deliver to</span>
              <span className="location-address">
                {deliveryLocation}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Restaurant and food search bar */}
        {showSearch && (
          <div className="header-search">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search restaurants, cuisines, dishes..."
              compact
            />
          </div>
        )}

        {/* Right Side: Favourites + Cart + User Profile Avatar */}
        <div className="header-actions">
          {/* Favourites Control */}
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

          {/* Cart Bag Control */}
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
                {effectiveCartItems.length === 0 ? (
                  <p className="cart-empty">
                    Your bag is empty. Add a dish that makes you smile.
                  </p>
                ) : (
                  <>
                    <ul className="cart-item-list">
                      {effectiveCartItems.map((item) => (
                        <li className="cart-item" key={item.id}>
                          <span>
                            <b>{item.name}</b>
                            <small>
                              {item.quantity || 1} × ₹{item.price}
                            </small>
                          </span>
                          <b>₹{(item.price || 0) * (item.quantity || 1)}</b>
                        </li>
                      ))}
                    </ul>
                    <p className="cart-subtotal">
                      <span>Subtotal</span>
                      <strong>₹{cartSubtotal}</strong>
                    </p>
                    <div
                      className="cart-checkout-action"
                      style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid #eee4d6",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <Link
                        to="/checkout"
                        onClick={() => setCartIsOpen(false)}
                        className="block w-full text-center rounded-full bg-[#D90429] py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#b00320]"
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "center",
                          borderRadius: "9px",
                          background: "#D90429",
                          padding: "10px 14px",
                          color: "#fff",
                          fontWeight: "700",
                          textDecoration: "none",
                        }}
                      >
                        Checkout • ₹{cartSubtotal}
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setCartIsOpen(false)}
                        className="block w-full text-center rounded-full border border-[#eee4d6] bg-white py-2 text-xs font-bold text-[#5F584F] transition hover:bg-[#fffaf2]"
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "center",
                          borderRadius: "9px",
                          border: "1px solid #eee4d6",
                          background: "#ffffff",
                          padding: "8px 14px",
                          color: "#5F584F",
                          fontWeight: "700",
                          textDecoration: "none",
                        }}
                      >
                        View Full Bag
                      </Link>
                    </div>
                  </>
                )}
                {effectiveCartItems.length === 0 && (
                  <p className="cart-note">
                    Add dishes from any restaurant to start your order.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* User Profile / Avatar Dropdown */}
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
            <p className="max-w-40 text-xs text-[#D90429]" role="alert">
              {logoutError}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
