import { useState } from "react";

const providers = ["Google", "Facebook"];

export default function SocialLogin() {
  const [message, setMessage] = useState("");

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[#DDD3C7]" />
        <span className="text-xs font-medium text-[#746C61]">
          or continue with
        </span>
        <span className="h-px flex-1 bg-[#DDD3C7]" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() =>
              setMessage(
                `${provider} sign-in is unavailable until an OAuth provider is configured.`,
              )
            }
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DDD3C7] bg-[#FEF4E5] px-3 py-2 text-sm font-semibold text-[#000000] transition hover:border-[#D1011F] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D1011F] focus-visible:ring-offset-2"
          >
            <span aria-hidden="true" className="font-bold text-[#D1011F]">
              {provider === "Google" ? "G" : "f"}
            </span>
            {provider}
          </button>
        ))}
      </div>

      {message && (
        <p className="mt-3 text-sm text-[#746C61]" role="status">
          {message}
        </p>
      )}
    </div>
  );
}