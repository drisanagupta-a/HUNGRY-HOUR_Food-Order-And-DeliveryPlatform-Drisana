import { createContext, useCallback, useContext, useState } from "react";
import { ApiError, getMyProfile } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const setProfile = useCallback((profileData) => {
    setUser(profileData);
    setStatus("authenticated");
    setErrorMessage("");
  }, []);

  const clearProfile = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
    setErrorMessage("");
    // Also clean up legacy demo session keys if present
    try {
      localStorage.removeItem("hh_demo_session");
    } catch {
      // Storage unavailable or restricted
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const data = await getMyProfile();
      setUser(data);
      setStatus("authenticated");
      return data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearProfile();
        throw error;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Unable to verify your session. Please try again.";
      setErrorMessage(message);
      setStatus("error");
      throw error;
    }
  }, [clearProfile]);

  const value = {
    user,
    status,
    errorMessage,
    setProfile,
    clearProfile,
    fetchProfile,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
