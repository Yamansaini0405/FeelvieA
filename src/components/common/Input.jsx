export function Field({ label, hint, error, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-800">
        {label}
        {required && <span className="text-coral-500">*</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-xs text-ink-800/50">{hint}</span>
      )}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

const baseFieldClasses =
  "w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-800/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-surface-50 disabled:text-ink-800/50";

export function Input({ className = "", ...rest }) {
  return <input className={`${baseFieldClasses} ${className}`} {...rest} />;
}

export function Select({ className = "", children, ...rest }) {
  return (
    <select className={`${baseFieldClasses} ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...rest }) {
  return (
    <textarea
      className={`${baseFieldClasses} min-h-[88px] resize-y ${className}`}
      {...rest}
    />
  );
}
