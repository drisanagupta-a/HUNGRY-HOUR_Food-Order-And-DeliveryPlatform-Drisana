import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Restaurants from "./pages/Restaurants.jsx";
import RestaurantDetails from "./pages/RestaurantDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";
import Signup from "./pages/Signup.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import Intro from "./pages/Intro.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider, useCart } from "./context/CartContext.jsx";

function AppRoutes() {
  const { cartItems, addToCart, clearCart } = useCart();

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
            <Home cartItems={cartItems} onAddToCart={addToCart} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile cartItems={cartItems} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurants"
        element={
          <ProtectedRoute>
            <Restaurants cartItems={cartItems} onAddToCart={addToCart} />
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
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout cartItems={cartItems} onClearCart={clearCart} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderHistory cartItems={cartItems} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderTracking cartItems={cartItems} />
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
            path="/dev-dashboard-preview/restaurants"
            element={
              <Restaurants
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
          <Route
            path="/dev-dashboard-preview/cart"
            element={<Cart />}
          />
        </>
      )}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}
