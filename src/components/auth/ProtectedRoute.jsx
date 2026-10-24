import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <main className="flex min-h-screen items-center justify-center bg-[#FEF4E5] px-6">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#000000]">
            Could not verify your session
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#746C61]" role="alert">
            {errorMessage}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setAttempt((currentAttempt) => currentAttempt + 1)}
              className="rounded-xl bg-[#D1011F] px-4 py-3 text-sm font-bold text-white hover:bg-[#B9001B]"
            >
              Try again
            </button>
            <Link
              to="/login"
              className="rounded-xl border border-[#DDD3C7] px-4 py-3 text-sm font-bold text-[#5F584F] hover:bg-[#FEF4E5]"
            >
              Go to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#FEF4E5] px-6 text-sm text-[#746C61]"
      role="status"
      aria-live="polite"
    >
      Checking your session...
    </main>
  );
}
