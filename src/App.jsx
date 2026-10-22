import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Signup from "./pages/Signup.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<ResetPassword />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
