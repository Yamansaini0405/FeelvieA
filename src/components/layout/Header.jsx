import { Menu, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onMenuClick }) {
  const { logout } = useAuth();
  const location = useLocation();

  // Map routes to breadcrumb titles
  const routeTitles = {
    "/": "Dashboard",
    "/users": "Users",
    "/carousels": "Carousels",
    "/coupons": "Coupons",
    "/queries": "Queries",
    "/plans": "Plans",
    "/credits": "Credits",
    "/image-history": "Image History",
    "/subscriptions": "Subscriptions",
  };

  const currentTitle = routeTitles[location.pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-100 bg-white/80 px-6 backdrop-blur">
      {/* Mobile Menu Button */}
      <button
        className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb Header */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-500 font-medium">
        <span>Feelvie</span>
        <span>&gt;</span>
        <span className="text-neutral-900">{currentTitle}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button 
          className="relative text-neutral-600 hover:text-neutral-900 p-1"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#E27625]" />
        </button>

        {/* User Profile / Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title="Click to Sign out"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-semibold text-white">
            AD
          </div>
          <span className="text-xs font-semibold text-neutral-900">Admin</span>
        </button>
      </div>
    </header>
  );
}