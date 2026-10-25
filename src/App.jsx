import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Signup from "./pages/Signup.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import Intro from "./pages/Intro.jsx";

export default function App() {
  const [showIntroForLoginReload, setShowIntroForLoginReload] = useState(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/login") {
      return false;
    }

    return (
      window.performance
        ?.getEntriesByType("navigation")
        .some((entry) => entry.type === "reload") ?? false
    );
  });

  function finishLoginReloadIntro() {
    setShowIntroForLoginReload(false);
  }

  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route
        path="/login"
        element={
          showIntroForLoginReload ? (
            <Intro onComplete={finishLoginReloadIntro} />
          ) : (
            <Login />
          )
        }
      />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<ResetPassword />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
