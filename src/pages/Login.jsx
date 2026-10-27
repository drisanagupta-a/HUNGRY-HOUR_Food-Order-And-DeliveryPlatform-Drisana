import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import FormField from "../components/auth/FormField.jsx";
import SocialLogin from "../components/auth/SocialLogin.jsx";
import { loginSchema } from "../schemas/authSchema.js";
import { logIn } from "../services/authService.js";

export default function Login() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState(
    () => searchParams.get("error") || "",
  );
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const handleLogin = async ({ email, password }) => {
    setFormMessage("");

    try {
      await logIn(email, password);
      navigate("/home", { replace: true });
    } catch (error) {
      setFormMessage(
        error instanceof Error ? error.message : "Unable to log in. Please try again.",
      );
    }
  };

  const handleGuestLogin = () => {
    const demoUser = {
      id: "demo-001",
      name: "Demo User",
      email: "demo@hungryhour.local",
    };
    localStorage.setItem(
      "hh_demo_session",
      JSON.stringify({ isDemo: true, user: demoUser }),
    );
    sessionStorage.removeItem("hh_opening_intro_shown");
    navigate("/home", { replace: true });
  };

  return (
    <AuthLayout eyebrow="Welcome back" title="Log in">
      <form
        className="space-y-5"
        onSubmit={handleSubmit(handleLogin, () => setFormMessage(""))}
        noValidate
      >
        <FormField
          id="login-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          register={register("email")}
          error={errors.email?.message}
        />

        <FormField
          id="login-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          register={register("password")}
          error={errors.password?.message}
          trailingContent={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="rounded-md p-1 text-[#746C61] hover:text-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" size={18} />
              ) : (
                <Eye aria-hidden="true" size={18} />
              )}
            </button>
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-[#5F584F]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#DDD3C7] accent-[#D1011F] focus-visible:ring-2 focus-visible:ring-[#D1011F]"
              {...register("rememberMe")}
            />
            Remember me
          </label>
          <Link
            to="/reset-password"
            className="text-sm font-semibold text-[#D1011F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
          >
            Forgot password?
          </Link>
        </div>

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
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full rounded-xl border border-[#DDD3C7] px-4 py-3 text-sm font-bold text-[#24211d] transition hover:bg-[#fffaf2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2"
        >
          Continue as Guest
        </button>
      </form>

      <SocialLogin />

      <p className="mt-6 text-center text-sm text-[#5F584F]">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-bold text-[#D1011F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F]"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}