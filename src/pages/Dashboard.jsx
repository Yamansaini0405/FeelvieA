import { useEffect, useState } from "react";
import { Users, Sparkles, MessageSquare, Layers, TrendingUp } from "lucide-react";
import { listUsers } from "../api/users";

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

  const totalUsersFormatted = userCountError
    ? "—"
    : userCount === null
    ? "59" // Default display placeholder to match UI design sample
    : userCount;

  return (
    <div className=" max-w-7xl mx-auto space-y-8 bg-neutral-50/50 min-h-screen">
      {/* Title Header */}
      <div>
        <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
          OVERVIEW
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 mt-1">
          Command center
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          A single pane of glass across users, revenue, engagement and content.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Users */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#E27625]">
            <Users className="h-4 w-4" />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            TOTAL USERS
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-neutral-950">{totalUsersFormatted}</span>
            <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="h-3 w-3 mr-0.5 inline" /> +12%
            </span>
          </div>
        </div>

        {/* Card 2: Generations */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#E27625]">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            GENERATIONS
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-neutral-950">206</span>
            <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="h-3 w-3 mr-0.5 inline" /> +34%
            </span>
          </div>
        </div>

        {/* Card 3: Open Queries */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
            <MessageSquare className="h-4 w-4" />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            OPEN QUERIES
          </p>
          <p className="mt-1 text-2xl font-bold text-neutral-950">8</p>
        </div>

        {/* Card 4: Active Plans */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
            <Layers className="h-4 w-4" />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            ACTIVE PLANS
          </p>
          <p className="mt-1 text-2xl font-bold text-neutral-950">4</p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Chart: Activity Trend */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-neutral-950 flex items-center gap-2">
                <span className="text-[#E27625]">📈</span> Activity trend
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Last 7 days · new users vs generations
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#E27625]" /> Users
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Generations
              </span>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="relative h-56 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
              {/* Horizontal Grid lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f0f0f0" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#f0f0f0" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f0f0f0" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f0f0f0" strokeDasharray="3 3" />

              {/* Y Axis Labels */}
              <text x="-10" y="23" className="text-[10px] fill-neutral-400">120</text>
              <text x="-10" y="63" className="text-[10px] fill-neutral-400">90</text>
              <text x="-10" y="103" className="text-[10px] fill-neutral-400">60</text>
              <text x="-10" y="143" className="text-[10px] fill-neutral-400">30</text>
              <text x="-10" y="175" className="text-[10px] fill-neutral-400">0</text>

              {/* Blue Line Path (Generations) */}
              <path
                d="M 0 110 Q 80 80, 160 100 T 320 60 T 500 30"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
              />
              {/* Orange Line Path (Users) */}
              <path
                d="M 0 140 Q 80 130, 160 135 T 320 110 T 500 95"
                fill="none"
                stroke="#E27625"
                strokeWidth="2.5"
              />
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[11px] text-neutral-400 mt-2 px-1">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Donut Chart: User Segments */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-950 flex items-center gap-1.5">
              <span className="text-[#E27625] font-normal">$</span> User segments
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">Distribution by account status</p>
          </div>

          {/* SVG Donut */}
          <div className="flex justify-center my-6">
            <svg className="w-36 h-36" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#52A17B" strokeWidth="6" strokeDasharray="65 35" strokeDashoffset="25" />
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#D97706" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="60" />
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#78716C" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="40" />
            </svg>
          </div>

          {/* Legend Table */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-neutral-600">
                <span className="h-2 w-2 rounded-full bg-[#52A17B]" /> Active
              </span>
              <span className="font-semibold text-neutral-950">65%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-neutral-600">
                <span className="h-2 w-2 rounded-full bg-[#D97706]" /> Pending
              </span>
              <span className="font-semibold text-neutral-950">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-neutral-600">
                <span className="h-2 w-2 rounded-full bg-[#78716C]" /> Inactive
              </span>
              <span className="font-semibold text-neutral-950">15%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}