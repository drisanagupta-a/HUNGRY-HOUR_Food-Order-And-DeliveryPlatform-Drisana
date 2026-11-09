import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import FormField from "../components/auth/FormField.jsx";
import {
  otpSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "../schemas/authSchema.js";
import {
  requestPasswordReset,
  updatePasswordWithRecovery,
  verifyRecoveryOtp,
} from "../services/authService.js";

const RESEND_COOLDOWN_SECONDS = 45;

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // Multi-step recovery state: "request" | "verify" | "update" | "success"
  const [step, setStep] = useState(() => {
    if (
      location.pathname === "/update-password" &&
      location.state?.email &&
      location.state?.verified
    ) {
      return "update";
    }
    return "request";
  });

  const [email, setEmail] = useState(() => location.state?.email || "");
  const [recoveryToken, setRecoveryToken] = useState(
    () => location.state?.recoveryToken || null,
  );
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (step === "verify") {
    return (
      <VerifyRecoveryOtpStep
        email={email}
        resendCooldown={resendCooldown}
        setResendCooldown={setResendCooldown}
        onVerified={(token) => {
          setRecoveryToken(token);
          setStep("update");
        }}
        onChangeEmail={() => setStep("request")}
      />
    );
  }

  if (step === "update") {
    return (
      <UpdatePasswordStep
        email={email}
        recoveryToken={recoveryToken}
        onSuccess={() => setStep("success")}
      />
    );
  }

  if (step === "success") {
    return (
      <RecoverySuccessStep
        onContinue={() => navigate("/login", { replace: true })}
      />
    );
  }

  return (
    <RequestRecoveryStep
      initialEmail={email}
      onRequested={(submittedEmail) => {
        setEmail(submittedEmail);
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setStep("verify");
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Step 1: Request Password Recovery
// ---------------------------------------------------------------------------
function RequestRecoveryStep({ initialEmail = "", onRequested }) {
  const [formMessage, setFormMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: initialEmail },
  });

  const handleResetRequest = async ({ email: submittedEmail }) => {
    setFormMessage("");

    try {
      await requestPasswordReset(submittedEmail.trim());
      onRequested(submittedEmail.trim());
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : "Unable to request a password reset. Please try again.",
      );
    }
  };

  return (
    <AuthLayout eyebrow="FORGOT PASSWORD?" title="Reset password">
      <p className="mb-4 text-xs sm:text-sm leading-5 text-[#5F584F]">
        Enter your registered email address and we&apos;ll send you a six-digit
        verification code to reset your password.
      </p>

      <form
        className="space-y-4"
        onSubmit={handleSubmit(handleResetRequest, () => setFormMessage(""))}
        noValidate
      >
        <FormField
          id="reset-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          register={register("email")}
          error={errors.email?.message}
        />

        {formMessage && (
          <p className="text-xs leading-4 text-[#D1011F]" role="alert">
            {formMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#D1011F] px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-[#B9001B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
        >
          {isSubmitting ? "Sending code..." : "Send verification code"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-[#5F584F]">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-bold text-[#D1011F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
        >
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Verify Recovery OTP Code
// ---------------------------------------------------------------------------
function VerifyRecoveryOtpStep({
  email,
  resendCooldown,
  setResendCooldown,
  onVerified,
  onChangeEmail,
}) {
  const [feedback, setFeedback] = useState("");
  const [resendNotice, setResendNotice] = useState("");
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: "" },
  });

  const tokenField = register("token");

  const handleVerify = async ({ token }) => {
    setFeedback("");
    setResendNotice("");

    try {
      const result = await verifyRecoveryOtp(email, token.trim());

      // Extract any explicit recovery token string returned in the payload, if present.
      // Even if no token is in the JSON body, session cookies (sb-access-token) are included automatically.
      const extractedToken =
        result?.token ||
        result?.accessToken ||
        result?.recoveryToken ||
        result?.session?.access_token ||
        result?.data?.token ||
        result?.data?.accessToken ||
        null;

      onVerified(extractedToken);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Invalid or expired recovery code. Please check and try again.",
      );
    }
  };

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;

    setFeedback("");
    setResendNotice("");
    setIsResending(true);

    try {
      const result = await requestPasswordReset(email);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setResendNotice(
        typeof result?.message === "string"
          ? result.message
          : "A new verification code has been sent to your email.",
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to resend verification code. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout eyebrow="ACCOUNT RECOVERY" title="Verify recovery code">
      <p className="mb-4 text-xs sm:text-sm leading-5 text-[#5F584F]">
        Enter the six-digit verification code sent to{" "}
        <span className="font-semibold text-[#000000]">{email}</span>.
      </p>

      <form
        className="space-y-4"
        onSubmit={handleSubmit(handleVerify, () => setFeedback(""))}
        noValidate
      >
        <div className="space-y-1.5">
          <label
            htmlFor="recovery-token"
            className="block text-xs font-semibold text-[#000000]"
          >
            Verification code
          </label>
          <input
            id="recovery-token"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            aria-invalid={Boolean(errors.token)}
            aria-describedby={
              errors.token ? "recovery-token-error" : undefined
            }
            className="w-full rounded-xl border border-[#DDD3C7] bg-[#FEF4E5] px-4 py-2.5 sm:py-3 text-center text-lg tracking-[0.35em] text-[#000000] outline-none transition placeholder:text-[#746C61] focus:border-[#D1011F] focus:ring-2 focus:ring-[#D1011F]/15 aria-[invalid=true]:border-[#D1011F]"
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
              id="recovery-token-error"
              className="text-xs text-[#D1011F]"
              role="alert"
            >
              {errors.token.message}
            </p>
          )}
        </div>

        {feedback && (
          <p className="text-xs leading-4 text-[#D1011F]" role="alert">
            {feedback}
          </p>
        )}
        {resendNotice && (
          <p className="text-xs leading-4 text-emerald-700" role="status">
            {resendNotice}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isResending}
          className="w-full rounded-xl bg-[#D1011F] px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-[#B9001B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
        >
          {isSubmitting ? "Verifying code..." : "Verify code"}
        </button>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handleResend}
            disabled={isSubmitting || isResending || resendCooldown > 0}
            className="w-full rounded-xl border border-[#DDD3C7] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#000000] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending
              ? "Resending code..."
              : resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend verification code"}
          </button>

          <button
            type="button"
            onClick={onChangeEmail}
            disabled={isSubmitting || isResending}
            className="text-center text-xs font-semibold text-[#746C61] hover:text-[#000000] hover:underline transition"
          >
            Wrong email? Change email address
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Choose New Password
// ---------------------------------------------------------------------------
function UpdatePasswordStep({ email, recoveryToken, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const handlePasswordUpdate = async ({ newPassword }) => {
    setFormMessage("");

    try {
      await updatePasswordWithRecovery(newPassword, recoveryToken);
      onSuccess();
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your password. Please try again.",
      );
    }
  };

  return (
    <AuthLayout eyebrow="ACCOUNT RECOVERY" title="Choose a new password">
      <p className="mb-4 text-xs sm:text-sm leading-5 text-[#5F584F]">
        Your recovery code for{" "}
        <span className="font-semibold text-[#000000]">{email}</span> was
        accepted. Enter your new password below.
      </p>

      <form
        className="space-y-3"
        onSubmit={handleSubmit(handlePasswordUpdate, () => setFormMessage(""))}
        noValidate
      >
        <FormField
          id="new-password"
          label="New password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          register={register("newPassword")}
          error={errors.newPassword?.message}
          compact
          trailingContent={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="rounded-md p-1 text-[#746C61] hover:text-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" size={16} />
              ) : (
                <Eye aria-hidden="true" size={16} />
              )}
            </button>
          }
        />

        <FormField
          id="confirm-new-password"
          label="Confirm new password"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Enter your new password again"
          register={register("confirmPassword")}
          error={errors.confirmPassword?.message}
          compact
          trailingContent={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
              aria-pressed={showConfirmPassword}
              className="rounded-md p-1 text-[#746C61] hover:text-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
            >
              {showConfirmPassword ? (
                <EyeOff aria-hidden="true" size={16} />
              ) : (
                <Eye aria-hidden="true" size={16} />
              )}
            </button>
          }
        />

        {formMessage && (
          <p className="text-xs leading-4 text-[#D1011F]" role="alert">
            {formMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#D1011F] px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-[#B9001B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
        >
          {isSubmitting ? "Updating password..." : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Success Screen
// ---------------------------------------------------------------------------
function RecoverySuccessStep({ onContinue }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <AuthLayout eyebrow="ALL SET" title="Password updated">
      <div className="py-2 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 size={28} aria-hidden="true" />
        </div>
        <p className="mb-6 text-xs sm:text-sm leading-5 text-[#5F584F]">
          Your password has been reset successfully. You can now log in with
          your new credentials.
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-xl bg-[#D1011F] px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-[#B9001B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2 shadow-sm"
        >
          Continue to log in
        </button>
      </div>
    </AuthLayout>
  );
}