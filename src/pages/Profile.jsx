import { ArrowLeft, Calendar, CheckCircle2, Shield, User } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "../App.css";

function formatDate(isoString) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

export default function Profile({ cartItems = [] }) {
  const { user } = useAuth();

  return (
    <div className="food-home profile-page" id="top">
      <Navbar
        favoriteCount={0}
        cartItems={cartItems}
        homePath="/home"
        showSearch={false}
        showFavorites={false}
        showNavigation={false}
      />

      <main className="profile-main">
        <div className="profile-container">
          <Link className="profile-back-link" to="/home">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Home</span>
          </Link>

          <header className="profile-header">
            <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
            <h1>My Profile</h1>
            <p className="profile-subtitle">
              Your personal information and account details.
            </p>
          </header>

          {user ? (
            <div className="profile-card">
              <div className="profile-card-top">
                <div className="profile-avatar-large" aria-hidden="true">
                  {user.fullName ? (
                    user.fullName.charAt(0).toUpperCase()
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div className="profile-title-block">
                  <h2>{user.fullName}</h2>
                  <div className="profile-badges">
                    {user.accountStatus && (
                      <span className="profile-status-badge">
                        <CheckCircle2 size={13} aria-hidden="true" />
                        {user.accountStatus}
                      </span>
                    )}
                    {user.role && (
                      <span className="profile-role-badge">
                        <Shield size={13} aria-hidden="true" />
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <User size={18} aria-hidden="true" />
                  </div>
                  <div className="profile-detail-content">
                    <span className="profile-detail-label">Full Name</span>
                    <span className="profile-detail-value">
                      {user.fullName || "Not provided"}
                    </span>
                  </div>
                </div>

                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <Shield size={18} aria-hidden="true" />
                  </div>
                  <div className="profile-detail-content">
                    <span className="profile-detail-label">Role</span>
                    <span className="profile-detail-value capitalize">
                      {user.role || "Customer"}
                    </span>
                  </div>
                </div>

                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <CheckCircle2 size={18} aria-hidden="true" />
                  </div>
                  <div className="profile-detail-content">
                    <span className="profile-detail-label">Account Status</span>
                    <span className="profile-detail-value">
                      {user.accountStatus || "Active"}
                    </span>
                  </div>
                </div>

                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <Calendar size={18} aria-hidden="true" />
                  </div>
                  <div className="profile-detail-content">
                    <span className="profile-detail-label">Member Since</span>
                    <span className="profile-detail-value">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-loading" role="status">
              <span className="profile-spinner" aria-hidden="true" />
              <p>Loading your profile details...</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
