import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  MessageSquare,
  Layers,
  CreditCard,
  Ticket,
  GalleryHorizontal,
  History,
  Box,
  Search,
  Command,
} from "lucide-react";

// Categorized navigation structure matching the UI layout
const NAV_SECTIONS = [
  {
    title: "OVERVIEW",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
    ],
  },
  {
    title: "CUSTOMERS",
    items: [
      { to: "/users", label: "Users", icon: Users },
      { to: "/queries", label: "Support Queries", icon: MessageSquare },
    ],
  },
  {
    title: "REVENUE",
    items: [
      { to: "/plans", label: "Subscription Plans", icon: Layers },
      { to: "/credits", label: "Credit Packs", icon: CreditCard },
      { to: "/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { to: "/carousels", label: "Carousel", icon: GalleryHorizontal },
      { to: "/image-history", label: "Generation Logs", icon: History },
    ],
  },
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#151515] text-white transition-transform lg:static lg:translate-x-0 border-r border-neutral-800 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/10 text-white">
          <Box className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight text-white">Feelvie</p>
          <p className="text-[10px] uppercase tracking-wider text-neutral-400">
            ENTERPRISE CRM
          </p>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs cursor-pointer hover:bg-neutral-800/80 transition-colors">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Quick search</span>
          <div className="flex items-center gap-0.5 text-[10px] text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-6">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase mb-2">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-neutral-800/80 text-white font-semibold"
                        : "text-neutral-400 hover:bg-neutral-800/40 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator dot */}
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#E27625] -ml-1" />}
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Status Footer */}
      <div className="p-3 m-3 rounded-xl bg-neutral-900/60 border border-neutral-800/60 text-xs">
        <div className="flex items-center gap-2 text-white text-[11px] font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          All systems operational
        </div>
        <p className="text-[10px] text-neutral-500 mt-1 pl-4">Feelvie CRM · v2.0</p>
      </div>
    </aside>
  );
}