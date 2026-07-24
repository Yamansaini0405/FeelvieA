import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ title, onClose, children, width = "max-w-lg" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${width} max-h-[90vh] overflow-y-auto rounded-xl2 bg-white shadow-pop`}
      >
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
          <h2 className="font-display text-base font-semibold text-ink-950">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-800/50 hover:bg-surface-100 hover:text-ink-950"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
