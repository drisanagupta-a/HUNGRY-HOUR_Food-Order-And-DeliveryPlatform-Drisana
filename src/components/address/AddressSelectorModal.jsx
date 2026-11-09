import { useState } from "react";
import {
  Briefcase,
  Check,
  CheckCircle2,
  Home,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import { useAddress } from "../../context/AddressContext.jsx";
import AddressFormModal from "./AddressFormModal.jsx";

function getLabelIcon(label) {
  const normalized = (label || "").trim().toLowerCase();
  if (normalized === "home") return Home;
  if (normalized === "work" || normalized === "office") return Briefcase;
  return MapPin;
}

export default function AddressSelectorModal() {
  const {
    addresses,
    selectedAddress,
    selectAddress,
    isSelectorOpen,
    closeAddressSelector,
    isLoading,
  } = useAddress();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (!isSelectorOpen) return null;

  return (
    <>
      <div
        className="address-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-selector-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeAddressSelector();
          }
        }}
      >
        <div className="address-modal-card address-selector-modal">
          <div className="address-modal-header">
            <div>
              <h2 id="address-selector-title">Select Delivery Address</h2>
              <p>Choose where you would like your order delivered.</p>
            </div>
            <button
              type="button"
              className="address-modal-close"
              onClick={closeAddressSelector}
              aria-label="Close address selector"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="address-selector-body">
            {isLoading ? (
              <div className="address-empty-state">
                <span className="profile-btn-spinner" aria-hidden="true" />
                <p>Loading your saved addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="address-empty-state">
                <div className="address-empty-icon" aria-hidden="true">
                  <MapPin size={28} />
                </div>
                <h3>No saved addresses found</h3>
                <p>
                  Add a delivery address to ensure fast and accurate delivery to
                  your doorstep.
                </p>
                <button
                  type="button"
                  className="profile-save-btn"
                  onClick={() => setIsAddModalOpen(true)}
                  style={{ marginTop: "12px", width: "auto" }}
                >
                  <Plus size={16} aria-hidden="true" />
                  <span>Add Delivery Address</span>
                </button>
              </div>
            ) : (
              <>
                <div className="address-card-list">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress?.id === addr.id;
                    const Icon = getLabelIcon(addr.label);

                    return (
                      <div
                        key={addr.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => selectAddress(addr)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            selectAddress(addr);
                          }
                        }}
                        className={`address-select-item ${
                          isSelected ? "is-selected" : ""
                        }`}
                      >
                        <div className="address-item-left">
                          <div
                            className={`address-icon-box ${
                              isSelected ? "is-selected" : ""
                            }`}
                          >
                            <Icon size={18} aria-hidden="true" />
                          </div>

                          <div className="address-item-content">
                            <div className="address-item-topline">
                              <span className="address-item-label">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="address-badge-default">
                                  Default
                                </span>
                              )}
                              {isSelected && (
                                <span className="address-badge-selected">
                                  <Check size={11} aria-hidden="true" />
                                  Selected
                                </span>
                              )}
                            </div>

                            <p className="address-item-text">
                              {addr.fullAddress}
                            </p>

                            {(addr.city || addr.state || addr.postalCode) && (
                              <p className="address-item-subtext">
                                {[addr.city, addr.state, addr.postalCode]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}

                            {addr.deliveryInstructions && (
                              <p className="address-item-instructions">
                                Note: {addr.deliveryInstructions}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="address-item-action">
                          <div
                            className={`address-radio-indicator ${
                              isSelected ? "is-checked" : ""
                            }`}
                            aria-hidden="true"
                          >
                            {isSelected && <div className="radio-dot" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="address-selector-footer">
                  <button
                    type="button"
                    className="address-add-new-btn"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <Plus size={16} aria-hidden="true" />
                    <span>Add Another Address</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddressFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(saved) => {
            if (saved?.id) {
              selectAddress(saved);
            }
          }}
        />
      )}
    </>
  );
}
