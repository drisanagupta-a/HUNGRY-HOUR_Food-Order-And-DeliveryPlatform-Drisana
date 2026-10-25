import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import RestaurantDetails from "./pages/RestaurantDetails.jsx";
import Signup from "./pages/Signup.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import Intro from "./pages/Intro.jsx";

export default function App() {
  const [cartItems, setCartItems] = useState([]);
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

  function addToCart(dish) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === dish.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { ...dish, quantity: 1 }];
    });
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
            <Home cartItems={cartItems} onAddToCart={addToCart} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurants/:restaurantId"
        element={
          <ProtectedRoute>
            <RestaurantDetails
              cartItems={cartItems}
              onAddToCart={addToCart}
            />
          </ProtectedRoute>
        }
      />
      {import.meta.env.DEV && (
        <>
          <Route
            path="/dev-dashboard-preview"
            element={
              <Home
                cartItems={cartItems}
                onAddToCart={addToCart}
                isDevelopmentPreview
              />
            }
          />
          <Route
            path="/dev-dashboard-preview/restaurants/:restaurantId"
            element={
              <RestaurantDetails
                cartItems={cartItems}
                onAddToCart={addToCart}
                isDevelopmentPreview
              />
            }
          />
        </>
      )}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
