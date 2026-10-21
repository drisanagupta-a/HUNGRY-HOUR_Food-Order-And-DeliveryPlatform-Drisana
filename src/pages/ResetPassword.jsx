import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import FormField from "../components/auth/FormField.jsx";
import { resetPasswordSchema } from "../schemas/authSchema.js";

export default function ResetPassword() {
  const [formMessage, setFormMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleResetRequest = () => {
    setFormMessage(
      "Your email is valid, but password reset is not connected to a backend. No email was sent.",
    );
  };

  return (
    <AuthLayout eyebrow="Account recovery" title="Reset password">
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
          Send reset link
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