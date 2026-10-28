import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import FormField from "../components/auth/FormField.jsx";
import SocialLogin from "../components/auth/SocialLogin.jsx";
import { signupSchema } from "../schemas/authSchema.js";
import { signUp } from "../services/authService.js";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const handleSignup = async ({ fullName, email, password }) => {
    setFormMessage("");

    try {
      await signUp(fullName, email, password);
      navigate("/verify-otp", { state: { email }, replace: true });
    } catch (error) {
      if (error instanceof Error && error.message.includes("A registration is already pending for this email")) {
        setFormMessage(
          "A registration is already pending for this email. Would you like to proceed with verification?",
        );
        navigate("/verify-otp", { state: { email }, replace: true });
      } else {
        setFormMessage(
          error instanceof Error
            ? error.message
            : "Unable to create your account. Please try again.",
        );
      }
    }
  };

  return (
    <AuthLayout eyebrow="Welcome" title="Sign up">
      <form
        className="space-y-1.5 sm:space-y-2"
        onSubmit={handleSubmit(handleSignup, () => setFormMessage(""))}
        noValidate
      >
        <FormField
          id="signup-name"
          label="Full name"
          autoComplete="name"
          placeholder="Your name"
          register={register("fullName")}
          error={errors.fullName?.message}
          compact
        />

        <FormField
          id="signup-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          register={register("email")}
          error={errors.email?.message}
          compact
        />

        <FormField
          id="signup-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          register={register("password")}
          error={errors.password?.message}
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
        <p className="-mt-1 text-[11px] text-[#746C61]">
          Use 8 to 128 characters.
        </p>

        <FormField
          id="signup-confirm-password"
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Enter your password again"
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

        <div className="pt-0.5">
          <label className="flex items-start gap-1.5 text-xs leading-4 text-[#5F584F] cursor-pointer">
            <input
              type="checkbox"
              aria-invalid={Boolean(errors.acceptTerms)}
              aria-describedby={
                errors.acceptTerms ? "signup-terms-error" : undefined
              }
              className="mt-0.5 h-3.5 w-3.5 rounded border-[#DDD3C7] accent-[#D1011F] focus-visible:ring-2 focus-visible:ring-[#D1011F]"
              {...register("acceptTerms")}
            />
            <span>I agree to the terms and conditions.</span>
          </label>
          {errors.acceptTerms?.message && (
            <p
              id="signup-terms-error"
              className="mt-1 text-xs text-[#D1011F]"
              role="alert"
            >
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {formMessage && (
          <p className="text-xs leading-4 text-[#D1011F]" role="status">
            {formMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#D1011F] px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-[#B9001B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <SocialLogin compact />

      <p className="mt-2 text-center text-xs text-[#5F584F]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-[#D1011F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
