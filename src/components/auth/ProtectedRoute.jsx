import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, getMyProfile } from "../../services/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, setProfile, clearProfile } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState(() => (user ? "authenticated" : "checking"));
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;

    if (user && attempt === 0) {
      setStatus("authenticated");
      return;
    }

    setStatus("checking");
    setErrorMessage("");

    getMyProfile()
      .then((profileData) => {
        if (isCurrent) {
          setProfile(profileData);
          setStatus("authenticated");
        }
      })
      .catch((error) => {
        if (!isCurrent) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          clearProfile();
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
  }, [attempt, clearProfile, navigate, setProfile, user]);

  if (status === "authenticated") {
    return children;
  }

  if (status === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf2] px-5 py-10 text-[#24211d]">
        <section
          className="w-full max-w-md rounded-3xl border border-[#eee4d6] bg-white p-8 text-center shadow-sm"
          aria-labelledby="session-check-title"
        >
          <h1
            id="session-check-title"
            className="font-serif text-2xl font-semibold"
          >
            We couldn&apos;t verify your session
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#746b61]" role="alert">
            {errorMessage}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              className="rounded-xl bg-[#c92332] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a81725] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c92332] focus-visible:ring-offset-2"
              type="button"
              onClick={() => setAttempt((currentAttempt) => currentAttempt + 1)}
            >
              Try again
            </button>
            <button
              className="rounded-xl border border-[#e6b1a6] px-5 py-3 text-sm font-bold text-[#a81725] transition hover:bg-[#fff0e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c92332] focus-visible:ring-offset-2"
              type="button"
              onClick={() => navigate("/login", { replace: true })}
            >
              Go to login
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="grid min-h-screen place-items-center bg-[#fffaf2] px-5 text-[#746b61]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-[#c92332]/20 border-t-[#c92332]"
          aria-hidden="true"
        />
        <span className="text-sm font-medium">Checking your session...</span>
      </div>
    </main>
  );
}
