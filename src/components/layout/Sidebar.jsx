import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  GalleryHorizontal,
  Ticket,
  CreditCard,
  Layers,
  History,
  MessageSquare,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/users", label: "Users", icon: Users },
  { to: "/queries", label: "Queries", icon: MessageSquare },
  { to: "/carousels", label: "Carousel setting", icon: GalleryHorizontal },
  { to: "/coupons", label: "Coupons", icon: Ticket },
  { to: "/plans", label: "Subscription plans", icon: Layers },
  { to: "/credits", label: "Credit setting", icon: CreditCard },
  { to: "/image-history", label: "Image generation history", icon: History },
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink-950 text-white transition-transform lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/95 ring-1 ring-white/10">
          <img
            src="/logofeelvie.png"
            alt="Feelvie logo"
            className="h-full w-full object-contain p-1"
          />
        </div>
        <div>
          <p className="font-display text-base font-bold leading-none">Feelvie</p>
          <p className="text-[11px] uppercase tracking-wider text-white/40">
            Admin console
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-500 text-white shadow-soft"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-[11px] text-white/30">
        Feelvie CRM · v1.0
      </div>
    </aside>
  );
}
