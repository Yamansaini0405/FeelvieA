import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  ArrowUpDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import SubscriptionDetailModal from "./SubscriptionDetailModal";
import { listSubscriptions } from "../../api/subscriptions";

export default function UserSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Table State: Search, Sorting, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("user_email");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSubscriptions = useCallback(() => {
    setLoading(true);
    setError("");
    listSubscriptions()
      .then((res) => setSubscriptions(res.data || []))
      .catch(() =>
        setError(
          "Couldn't load subscriptions. Check your connection and try again."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(fetchSubscriptions, [fetchSubscriptions]);

  // 1. Search Logic
  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) return subscriptions;
    const query = searchQuery.toLowerCase();
    return subscriptions.filter((sub) => {
      const email = (sub.user_email || "").toLowerCase();
      const planName = (sub.plan?.name || "").toLowerCase();
      return email.includes(query) || planName.includes(query);
    });
  }, [subscriptions, searchQuery]);

  // 2. Sorting Logic
  const sortedSubscriptions = useMemo(() => {
    return [...filteredSubscriptions].sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortField === "user_email") {
        aValue = (a.user_email || "").toLowerCase();
        bValue = (b.user_email || "").toLowerCase();
      } else if (sortField === "plan") {
        aValue = (a.plan?.name || "").toLowerCase();
        bValue = (b.plan?.name || "").toLowerCase();
      } else if (sortField === "status") {
        aValue = (a.status || "").toLowerCase();
        bValue = (b.status || "").toLowerCase();
      } else if (sortField === "billing_cycle") {
        aValue = (a.plan?.billing_cycle || "").toLowerCase();
        bValue = (b.plan?.billing_cycle || "").toLowerCase();
      } else if (sortField === "period_end") {
        aValue = a.current_period_end
          ? new Date(a.current_period_end).getTime()
          : 0;
        bValue = b.current_period_end
          ? new Date(b.current_period_end).getTime()
          : 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredSubscriptions, sortField, sortOrder]);

  // 3. Pagination Logic
  const totalItems = sortedSubscriptions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSubscriptions = useMemo(() => {
    return sortedSubscriptions.slice(startIndex, startIndex + pageSize);
  }, [sortedSubscriptions, startIndex, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-100",
          icon: "text-emerald-500",
        };
      case "inactive":
      case "paused":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-100",
          icon: "text-amber-500",
        };
      case "cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-100",
          icon: "text-red-500",
        };
      default:
        return {
          bg: "bg-neutral-50",
          text: "text-neutral-700",
          border: "border-neutral-100",
          icon: "text-neutral-500",
        };
    }
  };

  // CSV Export Functionality
  const exportCSV = () => {
    const headers = [
      "User Email,Plan Name,Status,Billing Cycle,Price (INR),Credits/Month,Current Period End,Auto Renew\n",
    ];
    const rows = sortedSubscriptions.map((sub) => {
      const email = `"${sub.user_email || ""}"`;
      const planName = `"${sub.plan?.name || ""}"`;
      const status = sub.status;
      const billingCycle = sub.plan?.billing_cycle || "";
      const price = Math.abs(parseFloat(sub.plan?.price_inr || 0)).toFixed(2);
      const credits = sub.plan?.credits_per_month || 0;
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end).toLocaleDateString()
        : "—";
      const autoRenew = sub.auto_renew ? "Yes" : "No";
      return [
        email,
        planName,
        status,
        billingCycle,
        price,
        credits,
        periodEnd,
        autoRenew,
      ].join(",");
    });
    const blob = new Blob([headers.concat(rows).join("\n")], {
      type: "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_subscriptions.csv";
    a.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 bg-[#FAFAFA] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            SUBSCRIPTION MANAGEMENT
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 mt-0.5">
            User Subscriptions
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            View and manage all active user subscriptions and billing information.
          </p>
        </div>
      </div>

      {/* Toolbar: Search, Filters, CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by email or plan name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
            />
          </div>

          {/* Filter Button */}
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
            <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" />
            <span>Filters</span>
          </button>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5 text-neutral-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th
                  onClick={() => handleSort("user_email")}
                  className="py-3 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>User Email</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("plan")}
                  className="py-3 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Plan</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("billing_cycle")}
                  className="py-3 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Billing Cycle</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Credits/Month</th>
                <th
                  onClick={() => handleSort("period_end")}
                  className="py-3 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Period Ends</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Auto Renew</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-400">
                    Loading subscriptions...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-400">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                paginatedSubscriptions.map((sub) => {
                  const statusColors = getStatusColor(sub.status);
                  return (
                    <tr key={sub.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* User Email */}
                      <td className="py-3.5 px-4 font-medium text-neutral-900">
                        {sub.user_email}
                      </td>

                      {/* Plan Name */}
                      <td className="py-3.5 px-4 text-neutral-600">
                        {sub.plan?.name || "—"}
                      </td>

                      {/* Billing Cycle */}
                      <td className="py-3.5 px-4 text-neutral-600">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100/60">
                          {sub.plan?.billing_cycle
                            ? sub.plan.billing_cycle
                                .charAt(0)
                                .toUpperCase() +
                              sub.plan.billing_cycle.slice(1)
                            : "—"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusColors.icon}`}
                          />
                          {sub.status.charAt(0).toUpperCase() +
                            sub.status.slice(1)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-medium text-neutral-900">
                        ₹
                        {Math.abs(
                          parseFloat(sub.plan?.price_inr || 0)
                        ).toFixed(2)}
                      </td>

                      {/* Credits per Month */}
                      <td className="py-3.5 px-4 text-neutral-600">
                        {sub.plan?.credits_per_month?.toLocaleString() || "—"}
                      </td>

                      {/* Period End */}
                      <td className="py-3.5 px-4 text-neutral-600">
                        {sub.current_period_end
                          ? new Date(sub.current_period_end).toLocaleDateString(
                              "en-US"
                            )
                          : "—"}
                      </td>

                      {/* Auto Renew */}
                      <td className="py-3.5 px-4">
                        {sub.auto_renew ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span className="text-[11px] font-medium text-emerald-700">
                              Yes
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className="text-[11px] font-medium text-amber-700">
                              No
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 px-4 text-right relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === sub.id ? null : sub.id)
                          }
                          className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Dropdown Action Menu */}
                        {activeMenuId === sub.id && (
                          <div className="absolute right-4 top-10 z-10 w-32 rounded-lg bg-white p-1 shadow-lg border border-neutral-200 text-left">
                            <button
                              onClick={() => {
                                setSelectedSubscriptionId(sub.id);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-neutral-100 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-700 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-2">
              Showing{" "}
              <strong className="text-neutral-800">
                {totalItems === 0 ? 0 : startIndex + 1}-
                {Math.min(startIndex + pageSize, totalItems)}
              </strong>{" "}
              of <strong className="text-neutral-800">{totalItems}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <span>
              Page <strong>{currentPage}</strong> / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Detail Modal */}
      {selectedSubscriptionId && (
        <SubscriptionDetailModal
          subscriptionId={selectedSubscriptionId}
          onClose={() => setSelectedSubscriptionId(null)}
        />
      )}
    </div>
  );
}