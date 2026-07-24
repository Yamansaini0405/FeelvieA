import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  ArrowUpDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
} from "lucide-react";
import Button from "../../components/common/Button";
import PlansFormModal from "./PlansFormModal";
import { listPlans } from "../../api/plans";

export default function PlansPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { mode, plan }
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Table Controls State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPlans = () => {
    setLoading(true);
    setError("");
    listPlans()
      .then((res) => setItems(res.data || []))
      .catch(() => setError("Couldn't load subscription plans."))
      .finally(() => setLoading(false));
  };

  useEffect(fetchPlans, []);

  const handleSaved = () => {
    setModal(null);
    fetchPlans();
  };

  // 1. Search Logic
  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const audience = (p.audience || "").toLowerCase();
      const billing = (p.billing_cycle || "").toLowerCase();
      return name.includes(query) || audience.includes(query) || billing.includes(query);
    });
  }, [items, searchQuery]);

  // 2. Sorting Logic
  const sortedPlans = useMemo(() => {
    return [...filteredPlans].sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortField === "name") {
        aValue = (a.name || "").toLowerCase();
        bValue = (b.name || "").toLowerCase();
      } else if (sortField === "audience") {
        aValue = (a.audience || "").toLowerCase();
        bValue = (b.audience || "").toLowerCase();
      } else if (sortField === "price") {
        aValue = Number(a.price_inr || 0);
        bValue = Number(b.price_inr || 0);
      } else if (sortField === "credits") {
        aValue = Number(a.credits_per_month || 0);
        bValue = Number(b.credits_per_month || 0);
      } else if (sortField === "status") {
        aValue = a.is_active ? "active" : "inactive";
        bValue = b.is_active ? "active" : "inactive";
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredPlans, sortField, sortOrder]);

  // 3. Pagination Logic
  const totalItems = sortedPlans.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPlans = useMemo(() => {
    return sortedPlans.slice(startIndex, startIndex + pageSize);
  }, [sortedPlans, startIndex, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // CSV Export Functionality
  const exportCSV = () => {
    const headers = ["Plan,Billing Cycle,Audience,Price (INR),Credits/mo,Extra Credit Price (INR),Status\n"];
    const csvRows = sortedPlans.map((p) => {
      const name = `"${p.name || ""}"`;
      const billing = `"${p.billing_cycle || ""}"`;
      const audience = `"${p.audience || ""}"`;
      const price = `"${p.price_inr || 0}"`;
      const credits = `"${p.credits_per_month || 0}"`;
      const extraCredit = `"${p.extra_credit_price_inr || 0}"`;
      const status = p.is_active ? "Active" : "Inactive";
      return [name, billing, audience, price, credits, extraCredit, status].join(",");
    });
    const blob = new Blob([headers.concat(csvRows).join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscription_plans.csv";
    a.click();
  };

  return (
    <div className=" max-w-[1400px] mx-auto space-y-6 bg-[#FAFAFA] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            REVENUE
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 mt-0.5">
            Subscription plans
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Recurring plans available across B2C and B2B tiers.
          </p>
        </div>
        <Button
          onClick={() => setModal({ mode: "create" })}
          className="!bg-neutral-950 hover:!bg-neutral-800 !text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add plan
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search plans..."
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

      {/* Main Table Card */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th
                  onClick={() => handleSort("name")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700 w-1/4"
                >
                  <div className="flex items-center gap-1">
                    <span>Plan</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("audience")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Audience</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("price")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Price</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("credits")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Credits / mo</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-6">EXTRA CREDIT</th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    Loading subscription plans...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No subscription plans found.
                  </td>
                </tr>
              ) : (
                paginatedPlans.map((p) => {
                  const audienceUpper = (p.audience || "B2B").toUpperCase();
                  const isB2B = audienceUpper === "B2B";

                  return (
                    <tr key={p.id || p.name} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Plan Title and Subtitle */}
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-neutral-900">{p.name}</p>
                          <p className="text-[11px] text-neutral-400 capitalize mt-0.5">
                            {p.billing_cycle || "Monthly"}
                          </p>
                        </div>
                      </td>

                      {/* Audience Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            isB2B
                              ? "bg-orange-50 text-[#E27625] border-orange-200/50"
                              : "bg-indigo-50 text-indigo-600 border-indigo-100"
                          }`}
                        >
                          {audienceUpper}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-semibold text-neutral-900">
                        ₹{Number(p.price_inr || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Credits / mo */}
                      <td className="py-4 px-6 text-neutral-700 font-medium">
                        {p.credits_per_month}
                      </td>

                      {/* Extra Credit Price */}
                      <td className="py-4 px-6 text-neutral-700 font-medium">
                        ₹{Number(p.extra_credit_price_inr || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {p.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Action Menu */}
                      <td className="py-4 px-6 text-right relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === p.id ? null : p.id)
                          }
                          className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Actions Context Menu */}
                        {activeMenuId === p.id && (
                          <div className="absolute right-6 top-10 z-10 w-32 rounded-lg bg-white p-1 shadow-lg border border-neutral-200 text-left">
                            <button
                              onClick={() => {
                                setModal({ mode: "view", plan: p });
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button
                              onClick={() => {
                                setModal({ mode: "edit", plan: p });
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 border-t border-neutral-100 text-xs text-neutral-500">
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

      {/* Plan Form Modal */}
      {modal && (
        <PlansFormModal
          mode={modal.mode}
          plan={modal.plan}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}