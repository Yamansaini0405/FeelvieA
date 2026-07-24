import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onMenuClick }) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
      <button
        className="rounded-lg p-2 text-ink-800 hover:bg-surface-100 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-800/70 hover:bg-surface-100 hover:text-ink-950"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </header>
  );
}
