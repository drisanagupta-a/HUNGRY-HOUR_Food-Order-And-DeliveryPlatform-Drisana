import { useState } from "react";
import { Heart, ShoppingBag, UserRound, X } from "lucide-react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";

export default function Navbar({
  searchText,
  setSearchText,
  favoriteCount,
  cartItems,
  onFavoritesClick,
}) {
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/home" aria-label="Hungry Hour home">
          <span className="brand-mark" aria-hidden="true">
            hh
          </span>
          <span className="brand-name">
            HUNGRY <b>HOUR</b>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-link nav-link-active" href="#top">
            Home
          </a>
          <a className="nav-link" href="#restaurants">
            Restaurants
          </a>
          <a className="nav-link" href="#offers">
            Offers
          </a>
          <a className="nav-link" href="#help">
            Help
          </a>
        </nav>

        <div className="header-search">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Find something delicious"
            compact
          />
        </div>

        <div className="header-actions">
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
                )}
                <p className="cart-note">
                  This sample bag is for browsing only. Checkout isn&apos;t
                  connected.
                </p>
              </div>
            )}
          </div>
          <Link className="profile-link" to="/login">
            <UserRound size={18} aria-hidden="true" />
            <span>Log in</span>
          </Link>
        </div>
      </div>
    </header>
  );
}