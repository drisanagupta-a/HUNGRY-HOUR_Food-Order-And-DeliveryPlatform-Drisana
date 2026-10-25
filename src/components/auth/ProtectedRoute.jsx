import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../common/Loader.jsx";
import { ApiError, getMyProfile } from "../../services/authService.js";

export default function ProtectedRoute({ children }) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;
    setStatus("checking");
    setErrorMessage("");

    getMyProfile()
      .then(() => {
        if (isCurrent) {
          setStatus("authenticated");
        }
      })
      .catch((error) => {
        if (!isCurrent) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          navigate(
            `/login?error=${encodeURIComponent("Your session expired. Please log in again.")}`,
            { replace: true },
          );
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify your session. Please try again.",
        );
        setStatus("error");
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt, navigate]);

  if (status === "authenticated") {
    return children;
  }

  if (status === "error") {
    return (
      <Loader
        error={errorMessage}
        onRetry={() => setAttempt((currentAttempt) => currentAttempt + 1)}
        onLogin={() => navigate("/login", { replace: true })}
      />
    );
  }

  return <Loader />;
}
