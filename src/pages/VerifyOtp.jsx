import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { otpSchema } from "../schemas/authSchema.js";
import {
  ApiError,
  getMyProfile,
  resendOtp,
  verifyOtp,
} from "../services/authService.js";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email =
    typeof location.state?.email === "string"
      ? location.state.email.trim()
      : "";
  const [feedback, setFeedback] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [sessionStatus, setSessionStatus] = useState("not-checked");
  const [sessionError, setSessionError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: "" },
  });
  const tokenField = register("token");

  async function confirmSession() {
    setSessionStatus("checking");
    setSessionError("");

    try {
      await getMyProfile();
      sessionStorage.setItem("hh_craving_intro_pending", "1");
      sessionStorage.removeItem("hh_opening_intro_shown");
      navigate("/home", { state: { cravingIntro: true }, replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setSessionStatus("login-required");
        return;
      }

      setSessionError(
        error instanceof Error
          ? error.message
          : "Unable to confirm your sign-in session. Please try again.",
      );
      setSessionStatus("check-failed");
    }
  }

  async function handleVerify({ token }) {
    setFeedback("");
    setResendMessage("");

    try {
      const result = await verifyOtp(email, token);
      setVerificationComplete(true);
      setVerificationMessage(
        typeof result?.message === "string" ? result.message : "",
      );
      await confirmSession();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to verify this code. Please try again.",
      );
    }
  }

  async function handleResend() {
    setFeedback("");
    setResendMessage("");
    setIsResending(true);

    try {
      const result = await resendOtp(email);
      setResendMessage(
        typeof result?.message === "string"
          ? result.message
          : "A new verification code has been requested.",
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to resend the code. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  }

  if (!email) {
    return (
      <AuthLayout eyebrow="Email verification" title="Verify your email">
        <p className="text-sm leading-6 text-[#5F584F]">
          Start with sign up to receive a verification code.
        </p>
        <Link
          to="/signup"
          className="mt-5 inline-flex font-bold text-[#D1011F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
        >
          Go to sign up
        </Link>
      </AuthLayout>
    );
  }

  if (verificationComplete) {
    return (
      <AuthLayout eyebrow="Email verification" title="Verify your email">
        <p className="mb-5 text-sm leading-6 text-[#5F584F]" role="status">
          {verificationMessage || "Your verification code was accepted."}
        </p>

        {sessionStatus === "checking" && (
          <p className="text-sm text-[#746C61]" role="status">
            Checking your sign-in session...
          </p>
        )}

        {sessionStatus === "login-required" && (
          <>
            <p className="text-sm leading-6 text-[#5F584F]">
              No authenticated session was detected. Please log in to continue.
            </p>
            <Link
              to="/login"
              replace
              className="mt-5 inline-flex font-bold text-[#D1011F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
            >
              Continue to log in
            </Link>
          </>
        )}

        {sessionStatus === "check-failed" && (
          <>
            <p className="text-sm leading-6 text-[#D1011F]" role="alert">
              The code was accepted, but the sign-in session could not be
              confirmed: {sessionError}
            </p>
            <button
              type="button"
              onClick={confirmSession}
              className="mt-5 w-full rounded-xl border border-[#DDD3C7] px-4 py-3 text-sm font-bold text-[#000000] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Check session again
            </button>
            <Link
              to="/login"
              className="mt-4 inline-flex font-bold text-[#D1011F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
            >
              Continue to log in
            </Link>
          </>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout eyebrow="One more bite" title="Verify your email">
      <p className="mb-5 text-sm leading-6 text-[#5F584F]">
        Enter the six-digit verification code for{" "}
        <span className="font-semibold text-[#000000]">{email}</span>.
      </p>

      <form
        className="space-y-5"
        onSubmit={handleSubmit(handleVerify, () => setFeedback(""))}
        noValidate
      >
        <div className="space-y-2">
          <label
            htmlFor="verification-token"
            className="block text-sm font-semibold text-[#000000]"
          >
            Verification code
          </label>
          <input
            id="verification-token"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            aria-invalid={Boolean(errors.token)}
            aria-describedby={
              errors.token ? "verification-token-error" : undefined
            }
            className="w-full rounded-xl border border-[#DDD3C7] bg-[#FEF4E5] px-4 py-3 text-center text-lg tracking-[0.35em] text-[#000000] outline-none transition placeholder:text-[#746C61] focus:border-[#D1011F] focus:ring-2 focus:ring-[#D1011F]/15 aria-[invalid=true]:border-[#D1011F]"
            {...tokenField}
            onChange={(event) => {
              event.target.value = event.target.value
                .replace(/\D/g, "")
                .slice(0, 6);
              tokenField.onChange(event);
            }}
          />
          {errors.token?.message && (
            <p
              id="verification-token-error"
              className="text-sm text-[#D1011F]"
              role="alert"
            >
              {errors.token.message}
            </p>
          )}
        </div>

        {feedback && (
          <p className="text-sm leading-6 text-[#D1011F]" role="alert">
            {feedback}
          </p>
        )}
        {resendMessage && (
          <p className="text-sm leading-6 text-[#5F584F]" role="status">
            {resendMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isResending}
          className="w-full rounded-xl bg-[#D1011F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#B9001B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Verifying..." : "Verify email"}
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={isSubmitting || isResending}
          className="w-full rounded-xl border border-[#DDD3C7] px-4 py-3 text-sm font-bold text-[#000000] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isResending ? "Resending code..." : "Resend verification code"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#5F584F]">
        Wrong email?{" "}
        <Link
          to="/signup"
          className="font-bold text-[#D1011F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
        >
          Back to sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
