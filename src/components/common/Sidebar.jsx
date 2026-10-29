import { useEffect } from "react";
import {
  Home,
  LogOut,
  PackageCheck,
  Percent,
  ShoppingBag,
  User,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { logOut } from "../../services/authService.js";

export default function Sidebar({
  isOpen = true,
  onClose = () => {},
  cartCount = 0,
  onCartClick,
  activeSection = "home",
  onSelectSection = () => {},
}) {
  const location = useLocation();
  const { user, clearProfile } = useAuth();

  // Close drawer on mobile when pressing Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleLogout() {
    try {
      await logOut();
    } catch {
      // ignore
    } finally {
      clearProfile();
      window.location.href = "/login";
    }
  }

  const isPreview = location.pathname.startsWith("/dev-dashboard-preview");
  const homeHref = isPreview ? "/dev-dashboard-preview#top" : "/home#top";
  const restaurantsHref = isPreview
    ? "/dev-dashboard-preview/restaurants"
    : "/restaurants";
  const isHome =
    (location.pathname === "/home" ||
      location.pathname === "/" ||
      location.pathname === "/dev-dashboard-preview") &&
    activeSection === "home";
  const isRestaurants =
    location.pathname === "/restaurants" ||
    location.pathname === "/dev-dashboard-preview/restaurants" ||
    activeSection === "restaurants";

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      href: homeHref,
      active: isHome,
      onClick: () => {
        onSelectSection("home");
        if (
          location.pathname === "/home" ||
          location.pathname === "/dev-dashboard-preview"
        ) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        onClose();
      },
    },
    {
      id: "restaurants",
      label: "Restaurants",
      icon: UtensilsCrossed,
      href: restaurantsHref,
      active: isRestaurants,
      onClick: () => {
        onSelectSection("restaurants");
        onClose();
      },
    },
    {
      id: "offers",
      label: "Offers",
      icon: Percent,
      href: "/home#offers",
      active: isHome && activeSection === "offers",
      onClick: () => {
        onSelectSection("offers");
        const el = document.getElementById("offers");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
        onClose();
      },
    },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingBag,
      href: isPreview ? "/dev-dashboard-preview/cart" : "/cart",
      badge: cartCount > 0 ? cartCount : null,
      active:
        location.pathname === "/cart" ||
        location.pathname === "/dev-dashboard-preview/cart",
      onClick: () => {
        if (onCartClick) {
          onCartClick();
        }
        onClose();
      },
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      href: "/profile",
      active: location.pathname === "/profile",
      onClick: () => {
        onClose();
      },
    },
  ];

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div
        className={`sidebar-mobile-backdrop ${isOpen ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Aside */}
      <aside
        className={`left-sidebar ${isOpen ? "is-open" : "is-collapsed"}`}
        aria-label="Navigation sidebar"
      >
        <div className="sidebar-inner-content">
          {/* Mobile Drawer Top Header */}
          <div className="sidebar-drawer-header">
            <span className="sidebar-drawer-brand">
              HUNGRY <b>HOUR</b>
            </span>
            <button
              type="button"
              className="sidebar-drawer-close"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Navigation Links */}
          <nav className="sidebar-nav">
            <ul className="sidebar-nav-list">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id} className="sidebar-nav-item">
                    <Link
                      to={item.href}
                      onClick={item.onClick}
                      className={`sidebar-link ${item.active ? "is-active" : ""}`}
                      title={item.label}
                    >
                      <div className="sidebar-icon-wrap">
                        <Icon size={20} aria-hidden="true" />
                        {item.badge !== null && item.badge !== undefined && (
                          <span className="sidebar-count-badge">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="sidebar-label">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Secondary Links */}
          <div className="sidebar-bottom-actions">
            <Link
              to="/orders"
              onClick={onClose}
              className={`sidebar-link sidebar-sub-link ${
                location.pathname === "/orders" ? "is-active" : ""
              }`}
              title="My Orders"
            >
              <div className="sidebar-icon-wrap">
                <PackageCheck size={18} aria-hidden="true" />
              </div>
              <span className="sidebar-label">My Orders</span>
            </Link>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="sidebar-link sidebar-logout-button"
                title="Log out"
              >
                <div className="sidebar-icon-wrap">
                  <LogOut size={18} aria-hidden="true" />
                </div>
                <span className="sidebar-label">Log out</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
