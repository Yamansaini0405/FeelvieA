import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Ticket,
  GalleryHorizontal,
  CreditCard,
  Layers,
  History,
  ArrowUpRight,
} from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import { listUsers } from "../api/users";

const CARD_ACCENTS = [
  "bg-brand-50 text-brand-600",
  "bg-coral-500/10 text-coral-500",
  "bg-ok/10 text-ok",
  "bg-warn/10 text-warn",
  "bg-brand-50 text-brand-600",
  "bg-coral-500/10 text-coral-500",
];

export default function Dashboard() {
  const [userCount, setUserCount] = useState(null);
  const [userCountError, setUserCountError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listUsers()
      .then((res) => {
        if (!cancelled) setUserCount(res.data?.length ?? 0);
      })
      .catch(() => {
        if (!cancelled) setUserCountError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      to: "/users",
      icon: Users,
      label: "User count",
      value: userCountError ? "—" : userCount === null ? "…" : userCount,
    },
    { to: "/coupons", icon: Ticket, label: "Coupons", value: "Manage" },
    {
      to: "/carousels",
      icon: GalleryHorizontal,
      label: "Carousel setting",
      value: "Manage",
    },
    { to: "/credits", icon: CreditCard, label: "Credit setting", value: "View" },
    { to: "/plans", icon: Layers, label: "Subscription plans", value: "View" },
    {
      to: "/image-history",
      icon: History,
      label: "Image generation history",
      value: "View",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Quick access to everything you manage in Feelvie."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ to, icon: Icon, label, value }, idx) => (
          <Link
            key={to}
            to={to}
            className="group relative overflow-hidden rounded-xl2 border border-surface-200 bg-white p-5 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-pop"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${CARD_ACCENTS[idx % CARD_ACCENTS.length]}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-ink-800/20 transition-colors group-hover:text-brand-500" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-ink-950">{value}</p>
            <p className="mt-1 text-sm text-ink-800/50">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
