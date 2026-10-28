import { useState } from "react";

export default function SocialLogin({ compact = false }) {
  const [message, setMessage] = useState("");

  return (
    <div className={compact ? "mt-3.5 sm:mt-4" : "mt-6"}>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[#DDD3C7]" />
        <span className="text-xs font-medium text-[#746C61]">
          or continue with
        </span>
        <span className="h-px flex-1 bg-[#DDD3C7]" />
      </div>

      <div className={compact ? "mt-2.5 sm:mt-3" : "mt-4"}>
        <button
          type="button"
          onClick={() =>
            setMessage(
              "Google sign-in is unavailable until an OAuth provider is configured.",
            )
          }
          className={`flex ${
            compact ? "min-h-10 py-1.5 sm:py-2" : "min-h-11 py-2"
          } w-full items-center justify-center gap-2 rounded-xl border border-[#DDD3C7] bg-[#FEF4E5] px-4 text-sm font-semibold text-[#000000] transition hover:border-[#D1011F] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2`}
        >
          <span aria-hidden="true" className="font-bold text-[#D1011F]">
            G
          </span>
          <span>Google</span>
        </button>
      </div>

      {message && (
        <p className="mt-2 text-center text-xs text-[#746C61]" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
