import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import FormField from "../components/auth/FormField.jsx";
import {
  resetPasswordSchema,
  updatePasswordSchema,
} from "../schemas/authSchema.js";
import {
  requestPasswordReset,
  updatePassword,
} from "../services/authService.js";

export default function ResetPassword() {
  const location = useLocation();

  return location.pathname === "/update-password" ? (
    <UpdatePasswordForm />
  ) : (
    <ForgotPasswordForm />
  );
}

function ForgotPasswordForm() {
  const [formMessage, setFormMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleResetRequest = async ({ email }) => {
    setFormMessage("");

    try {
      const result = await requestPasswordReset(email);
      setFormMessage(
        result.message ||
          "The backend received the request. Check your email if the address is registered.",
      );
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
      <form
        className="space-y-5"
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
          <p className="text-sm leading-6 text-[#746C61]" role="status">
            {formMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#D1011F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#B9001B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#5F584F]">
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

function UpdatePasswordForm() {
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
      const result = await updatePassword(newPassword);
      setFormMessage(result.message || "Your password was updated.");
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your password. Please try again.",
      );
    }
  };

  return (
    <AuthLayout eyebrow="Account recovery" title="Choose a new password">
      <form
        className="space-y-5"
        onSubmit={handleSubmit(handlePasswordUpdate, () => setFormMessage(""))}
        noValidate
      >
        <FormField
          id="new-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          register={register("newPassword")}
          error={errors.newPassword?.message}
        />
        <FormField
          id="confirm-new-password"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Enter your new password again"
          register={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        {formMessage && (
          <p className="text-sm leading-6 text-[#746C61]" role="status">
            {formMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#D1011F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#B9001B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#5F584F]">
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