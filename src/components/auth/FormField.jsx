export default function FormField({
  id,
  label,
  type = "text",
  register,
  error,
  autoComplete,
  placeholder,
  trailingContent,
}) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-[#000000]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-xl border border-[#DDD3C7] bg-[#FEF4E5] py-3 pl-4 text-sm text-[#000000] outline-none transition placeholder:text-[#746C61] focus:border-[#D1011F] focus:ring-2 focus:ring-[#D1011F]/15 aria-[invalid=true]:border-[#D1011F] ${
            trailingContent ? "pr-11" : "pr-4"
          }`}
          {...register}
        />
        {trailingContent && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {trailingContent}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-[#D1011F]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}