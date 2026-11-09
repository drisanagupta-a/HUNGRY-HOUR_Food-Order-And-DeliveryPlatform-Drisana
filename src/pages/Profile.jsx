import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  Lock,
  Shield,
  SlidersHorizontal,
  Smartphone,
  User,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import FormField from "../components/auth/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  changePasswordSchema,
  profileUpdateSchema,
} from "../schemas/authSchema.js";
import { updateMyProfile, updatePassword } from "../services/authService.js";
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

// ---------------------------------------------------------------------------
// 1. Customer Profile Card (View & Edit Mode)
// ---------------------------------------------------------------------------
function CustomerProfileCard({ user }) {
  const { setProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: user?.fullName || "",
    },
  });

  const handleOpenEdit = () => {
    reset({ fullName: user?.fullName || "" });
    setProfileError("");
    setProfileSuccess("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset({ fullName: user?.fullName || "" });
    setProfileError("");
    setIsEditing(false);
  };

  const onSaveProfile = async (data) => {
    setProfileError("");
    setProfileSuccess("");

    try {
      const updated = await updateMyProfile({
        fullName: data.fullName.trim(),
      });
      // Ensure compatibility: merge backend response with existing user session
      const mergedUser = { ...user, ...updated };
      setProfile(mergedUser);
      setProfileSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setProfileError(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again.",
      );
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-card-top">
        <div className="profile-avatar-large" aria-hidden="true">
          {user.fullName ? (
            user.fullName.charAt(0).toUpperCase()
          ) : (
            <User size={32} />
          )}
        </div>
        <div className="profile-card-header">
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

          {!isEditing && (
            <button
              type="button"
              onClick={handleOpenEdit}
              className="profile-edit-trigger-btn"
              aria-label="Edit Profile"
            >
              <Edit2 size={14} aria-hidden="true" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {profileSuccess && !isEditing && (
        <div
          className="profile-alert profile-alert-success"
          role="status"
          style={{ marginTop: "16px" }}
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {isEditing ? (
        <form
          className="profile-edit-form"
          onSubmit={handleSubmit(onSaveProfile)}
          noValidate
        >
          {profileError && (
            <div className="profile-alert profile-alert-error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{profileError}</span>
            </div>
          )}

          <div className="space-y-1 sm:space-y-1.5">
            <label
              htmlFor="profile-fullname"
              className="block font-semibold text-[#000000] text-xs sm:text-sm"
            >
              Full Name
            </label>
            <input
              id="profile-fullname"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={
                errors.fullName ? "profile-fullname-error" : undefined
              }
              className="w-full rounded-xl border border-[#DDD3C7] bg-[#FEF4E5] py-2 sm:py-2.5 px-3.5 text-xs sm:text-sm text-[#000000] outline-none transition placeholder:text-[#746C61] focus:border-[#D1011F] focus:ring-2 focus:ring-[#D1011F]/15 aria-[invalid=true]:border-[#D1011F] disabled:opacity-70 disabled:cursor-not-allowed"
              {...register("fullName")}
            />
            {errors.fullName?.message && (
              <p
                id="profile-fullname-error"
                className="text-xs text-[#D1011F]"
                role="alert"
              >
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="profile-readonly-note">
            <strong>Server-managed account details:</strong> Role (
            {user.role || "Customer"}), Account Status (
            {user.accountStatus || "Active"}), and Member Since (
            {formatDate(user.createdAt)}) are read-only.
          </div>

          <div className="profile-actions-row">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="profile-cancel-btn"
            >
              <X size={15} aria-hidden="true" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="profile-save-btn"
            >
              {isSubmitting ? (
                <>
                  <span className="profile-btn-spinner" aria-hidden="true" />
                  <span>Saving changes...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      ) : (
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
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Customer Preferences (Device-Only, localStorage)
// ---------------------------------------------------------------------------
const PREFERENCES_STORAGE_KEY = "hh_customer_preferences";

const DEFAULT_PREFERENCES = {
  dietaryPreference: "none",
  deliveryNote: "",
  receiveOrderUpdates: true,
};

function loadStoredPreferences() {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (err) {
    console.warn("Failed to load customer preferences from localStorage:", err);
    return DEFAULT_PREFERENCES;
  }
}

function CustomerPreferencesSection() {
  const [preferences, setPreferences] = useState(loadStoredPreferences);
  const [saveSuccess, setSaveSuccess] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(preferences),
      );
      setSaveSuccess("Preferences saved on this device.");
      setTimeout(() => setSaveSuccess(""), 4000);
    } catch (err) {
      console.warn("Failed to save customer preferences:", err);
    }
  };

  return (
    <section
      className="profile-preferences-card"
      aria-labelledby="customer-preferences-heading"
    >
      <div className="profile-security-header">
        <div className="profile-security-icon" aria-hidden="true">
          <SlidersHorizontal size={20} />
        </div>
        <div>
          <h2 id="customer-preferences-heading">
            Dining & Delivery Preferences
          </h2>
          <p>Customize your personal food preferences on this device.</p>
          <span className="profile-device-badge">
            <Smartphone size={12} aria-hidden="true" />
            Saved on this device only (not synced across devices)
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="profile-alert profile-alert-success" role="status">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <form className="profile-password-form" onSubmit={handleSave}>
        <div>
          <label
            htmlFor="dietary-preference-select"
            className="block text-xs font-semibold text-[#000000] mb-1.5"
          >
            Dietary Preference
          </label>
          <select
            id="dietary-preference-select"
            value={preferences.dietaryPreference}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                dietaryPreference: e.target.value,
              }))
            }
            className="profile-select-control"
          >
            <option value="none">No dietary restrictions</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="halal">Halal</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="delivery-note-input"
            className="block text-xs font-semibold text-[#000000] mb-1.5"
          >
            Default Delivery Instructions
          </label>
          <input
            id="delivery-note-input"
            type="text"
            value={preferences.deliveryNote}
            placeholder="e.g. Leave at front door, call upon arrival"
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                deliveryNote: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-[#DDD3C7] bg-[#FEF4E5] py-2.5 px-3.5 text-xs sm:text-sm text-[#000000] outline-none transition placeholder:text-[#746C61] focus:border-[#D1011F] focus:ring-2 focus:ring-[#D1011F]/15"
          />
        </div>

        <label className="profile-checkbox-label">
          <input
            type="checkbox"
            checked={preferences.receiveOrderUpdates}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                receiveOrderUpdates: e.target.checked,
              }))
            }
            className="profile-checkbox-input"
          />
          <span>Receive local order status notifications on this device</span>
        </label>

        <button
          type="submit"
          className="profile-submit-btn"
          style={{ width: "auto", alignSelf: "flex-start", marginTop: "4px" }}
        >
          Save Preferences
        </button>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. Authenticated Change Password Section
// ---------------------------------------------------------------------------
function ChangePasswordSection() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async ({ newPassword }) => {
    setFormError("");
    setSuccessMessage("");

    try {
      // Calls PUT /api/account/password with { newPassword } using cookie credentials
      await updatePassword(newPassword);
      setSuccessMessage("Your password has been changed successfully.");
      reset();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to update password. Please check your credentials and try again.",
      );
    }
  };

  return (
    <section
      className="profile-security-card"
      aria-labelledby="change-password-heading"
    >
      <div className="profile-security-header">
        <div className="profile-security-icon" aria-hidden="true">
          <Lock size={20} />
        </div>
        <div>
          <h2 id="change-password-heading">Change Password</h2>
          <p>Update your password to keep your account secure.</p>
        </div>
      </div>

      {successMessage && (
        <div className="profile-alert profile-alert-success" role="status">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {formError && (
        <div className="profile-alert profile-alert-error" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <form
        className="profile-password-form"
        onSubmit={handleSubmit(onSubmit, () => {
          setFormError("");
          setSuccessMessage("");
        })}
        noValidate
      >
        <FormField
          id="current-password"
          label="Current password"
          type={showCurrentPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your current password"
          register={register("currentPassword")}
          error={errors.currentPassword?.message}
          trailingContent={
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              aria-label={
                showCurrentPassword
                  ? "Hide current password"
                  : "Show current password"
              }
              aria-pressed={showCurrentPassword}
              className="rounded-md p-1 text-[#746C61] hover:text-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
            >
              {showCurrentPassword ? (
                <EyeOff aria-hidden="true" size={16} />
              ) : (
                <Eye aria-hidden="true" size={16} />
              )}
            </button>
          }
        />

        <FormField
          id="new-password"
          label="New password"
          type={showNewPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          register={register("newPassword")}
          error={errors.newPassword?.message}
          trailingContent={
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label={
                showNewPassword ? "Hide new password" : "Show new password"
              }
              aria-pressed={showNewPassword}
              className="rounded-md p-1 text-[#746C61] hover:text-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
            >
              {showNewPassword ? (
                <EyeOff aria-hidden="true" size={16} />
              ) : (
                <Eye aria-hidden="true" size={16} />
              )}
            </button>
          }
        />

        <FormField
          id="confirm-new-password"
          label="Confirm new password"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Enter new password again"
          register={register("confirmNewPassword")}
          error={errors.confirmNewPassword?.message}
          trailingContent={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
              aria-pressed={showConfirmPassword}
              className="rounded-md p-1 text-[#746C61] hover:text-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
            >
              {showConfirmPassword ? (
                <EyeOff aria-hidden="true" size={16} />
              ) : (
                <Eye aria-hidden="true" size={16} />
              )}
            </button>
          }
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="profile-submit-btn"
        >
          {isSubmitting ? (
            <>
              <span className="profile-btn-spinner" aria-hidden="true" />
              <span>Updating password...</span>
            </>
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 4. Main Profile Page
// ---------------------------------------------------------------------------
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
            <>
              <CustomerProfileCard user={user} />
              <CustomerPreferencesSection />
              <ChangePasswordSection />
            </>
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

