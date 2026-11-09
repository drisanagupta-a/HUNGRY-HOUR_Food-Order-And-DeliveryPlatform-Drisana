import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  fetchCustomerAddresses,
  setDefaultCustomerAddress,
  updateCustomerAddress,
} from "../services/addressService.js";

const SELECTED_ADDRESS_KEY = "hh_selected_address_id";

const AddressContext = createContext(null);

export function AddressProvider({ children }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  
  // Track selected address ID from localStorage
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(SELECTED_ADDRESS_KEY) || null;
    } catch {
      return null;
    }
  });

  const inFlightRef = useRef(false);

  // Load addresses from the backend
  const loadAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setAddressError("");
      return [];
    }

    setIsLoading(true);
    setAddressError("");

    try {
      const list = await fetchCustomerAddresses();
      const validList = Array.isArray(list) ? list.filter(Boolean) : [];
      setAddresses(validList);
      return validList;
    } catch (err) {
      console.warn("Could not load customer addresses:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load saved addresses.";
      setAddressError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load addresses on mount or when user changes
  useEffect(() => {
    if (user) {
      loadAddresses();
    } else {
      setAddresses([]);
      setSelectedAddressId(null);
      try {
        localStorage.removeItem(SELECTED_ADDRESS_KEY);
      } catch {
        // Ignore storage exceptions
      }
    }
  }, [user, loadAddresses]);

  // Compute selectedAddress with resolution order:
  // 1. Explicitly selected ID stored in localStorage (if found in addresses)
  // 2. Default address (isDefault === true)
  // 3. First address in the list
  // 4. null
  const selectedAddress = useMemo(() => {
    if (!addresses || addresses.length === 0) {
      return null;
    }

    if (selectedAddressId) {
      const matched = addresses.find((addr) => addr && addr.id === selectedAddressId);
      if (matched) return matched;
    }

    const defaultAddr = addresses.find((addr) => addr && addr.isDefault);
    if (defaultAddr) return defaultAddr;

    return addresses[0] || null;
  }, [addresses, selectedAddressId]);

  // Sync selectedAddressId with localStorage when selectedAddress changes
  useEffect(() => {
    if (selectedAddress?.id) {
      if (selectedAddress.id !== selectedAddressId) {
        setSelectedAddressId(selectedAddress.id);
      }
      try {
        localStorage.setItem(SELECTED_ADDRESS_KEY, selectedAddress.id);
      } catch {
        // Ignore storage exceptions
      }
    } else if (addresses.length === 0) {
      try {
        localStorage.removeItem(SELECTED_ADDRESS_KEY);
      } catch {
        // Ignore storage exceptions
      }
    }
  }, [selectedAddress, selectedAddressId, addresses.length]);

  // Select an address by object or ID
  const selectAddress = useCallback((addressOrId) => {
    const id =
      typeof addressOrId === "object" && addressOrId !== null
        ? addressOrId.id
        : addressOrId;

    if (!id) return;

    setSelectedAddressId(id);
    try {
      localStorage.setItem(SELECTED_ADDRESS_KEY, id);
    } catch {
      // Ignore storage exceptions
    }
    setIsSelectorOpen(false);
  }, []);

  // Add a new address
  const addAddress = useCallback(
    async (addressData) => {
      if (inFlightRef.current) return null;
      inFlightRef.current = true;
      setAddressError("");

      try {
        const created = await createCustomerAddress(addressData);
        await loadAddresses();
        // If created address was marked default or it was the first address, auto-select it
        if (created?.id && (addressData.isDefault || addresses.length === 0)) {
          selectAddress(created.id);
        }
        return created;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to save delivery address.";
        setAddressError(message);
        throw err;
      } finally {
        inFlightRef.current = false;
      }
    },
    [addresses.length, loadAddresses, selectAddress],
  );

  // Update an existing address
  const updateAddress = useCallback(
    async (id, addressData) => {
      if (inFlightRef.current || !id) return null;
      inFlightRef.current = true;
      setAddressError("");

      try {
        const updated = await updateCustomerAddress(id, addressData);
        await loadAddresses();
        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update delivery address.";
        setAddressError(message);
        throw err;
      } finally {
        inFlightRef.current = false;
      }
    },
    [loadAddresses],
  );

  // Delete an address
  const deleteAddress = useCallback(
    async (id) => {
      if (inFlightRef.current || !id) return;
      inFlightRef.current = true;
      setAddressError("");

      try {
        await deleteCustomerAddress(id);
        if (id === selectedAddressId) {
          try {
            localStorage.removeItem(SELECTED_ADDRESS_KEY);
          } catch {
            // Ignore
          }
          setSelectedAddressId(null);
        }
        await loadAddresses();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to delete delivery address.";
        setAddressError(message);
        throw err;
      } finally {
        inFlightRef.current = false;
      }
    },
    [selectedAddressId, loadAddresses],
  );

  // Set default address
  const setDefault = useCallback(
    async (id) => {
      if (inFlightRef.current || !id) return null;
      inFlightRef.current = true;
      setAddressError("");

      try {
        const updated = await setDefaultCustomerAddress(id);
        await loadAddresses();
        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to set default address.";
        setAddressError(message);
        throw err;
      } finally {
        inFlightRef.current = false;
      }
    },
    [loadAddresses],
  );

  const openAddressSelector = useCallback(() => {
    setIsSelectorOpen(true);
  }, []);

  const closeAddressSelector = useCallback(() => {
    setIsSelectorOpen(false);
  }, []);

  const value = {
    addresses,
    selectedAddress,
    selectedAddressId,
    isLoading,
    addressError,
    isSelectorOpen,
    openAddressSelector,
    closeAddressSelector,
    loadAddresses,
    selectAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefault,
  };

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("useAddress must be used within an AddressProvider");
  }
  return context;
}

export default AddressContext;
