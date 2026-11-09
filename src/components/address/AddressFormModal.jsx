import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Briefcase, Home, MapPin, X } from "lucide-react";
import { addressSchema } from "../../schemas/addressSchema.js";
import { useAddress } from "../../context/AddressContext.jsx";

const PRESET_LABELS = [
  { label: "Home", icon: Home },
  { label: "Work", icon: Briefcase },
  { label: "Other", icon: MapPin },
];

export default function AddressFormModal({
  isOpen,
  onClose,
  initialData = null,
  onSuccess,
}) {
  const { addAddress, updateAddress } = useAddress();
  const [submitError, setSubmitError] = useState("");

  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initialData?.label || "Home",
      fullAddress: initialData?.fullAddress || "",
      street: initialData?.street || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postalCode: initialData?.postalCode || "",
      deliveryInstructions: initialData?.deliveryInstructions || "",
      isDefault: initialData?.isDefault || false,
    },
  });

  const currentLabel = watch("label");

  // Re-initialize form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setSubmitError("");
      reset({
        label: initialData?.label || "Home",
        fullAddress: initialData?.fullAddress || "",
        street: initialData?.street || "",
        city: initialData?.city || "",
        state: initialData?.state || "",
        postalCode: initialData?.postalCode || "",
        deliveryInstructions: initialData?.deliveryInstructions || "",
        isDefault: initialData?.isDefault || false,
      });
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setSubmitError("");

    // Prepare clean payload strictly adhering to DeliveryAddressRequest
    const payload = {
      label: data.label.trim(),
      fullAddress: data.fullAddress.trim(),
      street: data.street?.trim() || undefined,
      city: data.city?.trim() || undefined,
      state: data.state?.trim() || undefined,
      postalCode: data.postalCode?.trim() || undefined,
      deliveryInstructions: data.deliveryInstructions?.trim() || undefined,
      isDefault: Boolean(data.isDefault),
    };

    try {
      let result;
      if (isEditing) {
        result = await updateAddress(initialData.id, payload);
      } else {
        result = await addAddress(payload);
      }

      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to save address. Please check your details and try again.",
      );
    }
  };

  return (
    <div
      className="address-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-form-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="address-modal-card address-form-modal">
        <div className="address-modal-header">
          <div>
            <h2 id="address-form-modal-title">
              {isEditing ? "Edit Delivery Address" : "Add Delivery Address"}
            </h2>
            <p>Enter your location details for accurate food delivery.</p>
          </div>
          <button
            type="button"
            className="address-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {submitError && (
          <div className="profile-alert profile-alert-error" role="alert" style={{ marginBottom: "16px" }}>
            <AlertCircle size={16} aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="address-form-body">
          {/* Label selector with chips */}
          <div className="address-form-group">
            <label className="address-form-label">Address Label *</label>
            <div className="address-chip-row">
              {PRESET_LABELS.map(({ label, icon: Icon }) => {
                const isSelected = currentLabel?.toLowerCase() === label.toLowerCase();
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setValue("label", label, { shouldValidate: true })}
                    className={`address-label-chip ${isSelected ? "is-selected" : ""}`}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Or enter custom label (e.g., Mom's place, Gym)"
              disabled={isSubmitting}
              className="address-form-input"
              {...register("label")}
              style={{ marginTop: "8px" }}
            />
            {errors.label && (
              <p className="address-form-error" role="alert">
                {errors.label.message}
              </p>
            )}
          </div>

          {/* Full address textarea */}
          <div className="address-form-group">
            <label htmlFor="modal-fullAddress" className="address-form-label">
              Complete Address (House/Flat, Building, Street, Area) *
            </label>
            <textarea
              id="modal-fullAddress"
              rows={3}
              placeholder="e.g. Flat 402, Sunshine Heights, 12th Main Road, Indiranagar"
              disabled={isSubmitting}
              className="address-form-textarea"
              {...register("fullAddress")}
            />
            {errors.fullAddress && (
              <p className="address-form-error" role="alert">
                {errors.fullAddress.message}
              </p>
            )}
          </div>

          {/* Street & City in 2 columns */}
          <div className="address-form-grid-2">
            <div className="address-form-group">
              <label htmlFor="modal-street" className="address-form-label">
                Street / Landmark (Optional)
              </label>
              <input
                id="modal-street"
                type="text"
                placeholder="e.g. Near Metro Station"
                disabled={isSubmitting}
                className="address-form-input"
                {...register("street")}
              />
              {errors.street && (
                <p className="address-form-error" role="alert">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="address-form-group">
              <label htmlFor="modal-city" className="address-form-label">
                City (Optional)
              </label>
              <input
                id="modal-city"
                type="text"
                placeholder="e.g. Bengaluru"
                disabled={isSubmitting}
                className="address-form-input"
                {...register("city")}
              />
              {errors.city && (
                <p className="address-form-error" role="alert">
                  {errors.city.message}
                </p>
              )}
            </div>
          </div>

          {/* State & Postal Code in 2 columns */}
          <div className="address-form-grid-2">
            <div className="address-form-group">
              <label htmlFor="modal-state" className="address-form-label">
                State (Optional)
              </label>
              <input
                id="modal-state"
                type="text"
                placeholder="e.g. Karnataka"
                disabled={isSubmitting}
                className="address-form-input"
                {...register("state")}
              />
              {errors.state && (
                <p className="address-form-error" role="alert">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div className="address-form-group">
              <label htmlFor="modal-postalCode" className="address-form-label">
                Postal Code (Optional)
              </label>
              <input
                id="modal-postalCode"
                type="text"
                placeholder="e.g. 560038"
                disabled={isSubmitting}
                className="address-form-input"
                {...register("postalCode")}
              />
              {errors.postalCode && (
                <p className="address-form-error" role="alert">
                  {errors.postalCode.message}
                </p>
              )}
            </div>
          </div>

          {/* Delivery instructions */}
          <div className="address-form-group">
            <label htmlFor="modal-deliveryInstructions" className="address-form-label">
              Delivery Instructions (Optional)
            </label>
            <input
              id="modal-deliveryInstructions"
              type="text"
              placeholder="e.g. Ring bell, leave with security, call on arrival"
              disabled={isSubmitting}
              className="address-form-input"
              {...register("deliveryInstructions")}
            />
            {errors.deliveryInstructions && (
              <p className="address-form-error" role="alert">
                {errors.deliveryInstructions.message}
              </p>
            )}
          </div>

          {/* Set as default checkbox */}
          <label className="profile-checkbox-label" style={{ marginTop: "4px" }}>
            <input
              type="checkbox"
              disabled={isSubmitting}
              className="profile-checkbox-input"
              {...register("isDefault")}
            />
            <span>Set as default delivery address</span>
          </label>

          {/* Actions */}
          <div className="address-modal-actions">
            <button
              type="button"
              className="profile-cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="profile-save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="profile-btn-spinner" aria-hidden="true" />
                  <span>{isEditing ? "Updating..." : "Saving..."}</span>
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Save Address"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
