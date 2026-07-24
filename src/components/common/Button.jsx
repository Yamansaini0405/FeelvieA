import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-soft disabled:bg-brand-300",
  ghost:
    "bg-transparent text-ink-800 hover:bg-surface-100 border border-surface-200",
  danger:
    "bg-transparent text-danger border border-danger/30 hover:bg-danger/10",
  subtle: "bg-surface-100 text-ink-800 hover:bg-surface-200",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  disabled,
  type = "button",
  ...rest
}) {
  const sizeClasses =
    size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${sizeClasses} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  );
}
