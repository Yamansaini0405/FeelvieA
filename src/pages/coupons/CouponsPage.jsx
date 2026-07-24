import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  Check,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CouponFormModal from "./CouponFormModal";
import { listCoupons, deleteCoupon } from "../../api/coupons";

export default function CouponsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { mode, coupon }
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Table State Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("code");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchItems = useCallback(() => {
    setLoading(true);
    setError("");
    listCoupons()
      .then((res) => setItems(res.data || []))
      .catch(() => setError("Couldn't load coupons."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(fetchItems, [fetchItems]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCoupon(pendingDelete.id);
      setPendingDelete(null);
      fetchItems();
    } catch {
      setDeleting(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // 1. Search Logic
  const filteredCoupons = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((c) => {
      const code = (c.code || "").toLowerCase();
      const audience = (c.target_audience || "").toLowerCase();
      const value = String(c.credit_value ?? "");
      return code.includes(query) || audience.includes(query) || value.includes(query);
    });
  }, [items, searchQuery]);

  // 2. Sorting Logic
  const sortedCoupons = useMemo(() => {
    return [...filteredCoupons].sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortField === "code") {
        aValue = (a.code || "").toLowerCase();
        bValue = (b.code || "").toLowerCase();
      } else if (sortField === "value") {
        aValue = Number(a.credit_value || 0);
        bValue = Number(b.credit_value || 0);
      } else if (sortField === "usage") {
        aValue = Number(a.used_count || 0) / Math.max(1, Number(a.max_uses || 1));
        bValue = Number(b.used_count || 0) / Math.max(1, Number(b.max_uses || 1));
      } else if (sortField === "audience") {
        aValue = (a.target_audience || "").toLowerCase();
        bValue = (b.target_audience || "").toLowerCase();
      } else if (sortField === "expires") {
        aValue = a.expires_at ? new Date(a.expires_at).getTime() : 0;
        bValue = b.expires_at ? new Date(b.expires_at).getTime() : 0;
      } else if (sortField === "status") {
        aValue = a.is_active ? "active" : "inactive";
        bValue = b.is_active ? "active" : "inactive";
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredCoupons, sortField, sortOrder]);

  // 3. Pagination Logic
  const totalItems = sortedCoupons.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCoupons = useMemo(() => {
    return sortedCoupons.slice(startIndex, startIndex + pageSize);
  }, [sortedCoupons, startIndex, pageSize]);

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
    const headers = ["Code,Value (credits),Used,Max Uses,Audience,Expires,Status\n"];
    const csvRows = sortedCoupons.map((c) => {
      const code = `"${c.code || ""}"`;
      const value = `"${c.credit_value || 0}"`;
      const used = `"${c.used_count || 0}"`;
      const maxUses = `"${c.max_uses || 1}"`;
      const audience = `"${c.target_audience || "All customers"}"`;
      const expires = `"${c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}"`;
      const status = c.is_active ? "Active" : "Inactive";
      return [code, value, used, maxUses, audience, expires, status].join(",");
    });
    const blob = new Blob([headers.concat(csvRows).join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "coupons_directory.csv";
    a.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 bg-[#FAFAFA] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            GROWTH
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 mt-0.5">
            Coupons
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Discount and credit codes for customer acquisition and retention.
          </p>
        </div>
        <Button
          onClick={() => setModal({ mode: "create" })}
          className="!bg-neutral-950 hover:!bg-neutral-800 !text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Create coupon
        </Button>
      </div>

      {/* Toolbar */}
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
              placeholder="Search by code, audience..."
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

      {/* Data Table Container */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-950"
                  />
                </th>
                <th
                  onClick={() => handleSort("code")}
                  className="py-3.5 px-4 cursor-pointer hover:text-neutral-700 w-1/4"
                >
                  <div className="flex items-center gap-1">
                    <span>Code</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("value")}
                  className="py-3.5 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Value</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("usage")}
                  className="py-3.5 px-4 cursor-pointer hover:text-neutral-700 w-44"
                >
                  <div className="flex items-center gap-1">
                    <span>Usage</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("audience")}
                  className="py-3.5 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Audience</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("expires")}
                  className="py-3.5 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Expires</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3.5 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400">
                    Loading coupons...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                paginatedCoupons.map((c) => {
                  const used = c.used_count ?? 0;
                  const max = c.max_uses ?? 1;
                  const usagePercentage = Math.min(100, Math.round((used / max) * 100));

                  return (
                    <tr key={c.id || c.code} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-950"
                        />
                      </td>

                      {/* Code Tag + Copy Button */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-neutral-100/80 px-2 py-1 rounded text-neutral-800 border border-neutral-200/50">
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            className="text-neutral-400 hover:text-neutral-700 transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-4 px-4 font-bold text-neutral-900">
                        {c.credit_value} credits
                      </td>

                      {/* Usage Progress Bar */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 max-w-[120px]">
                          <span className="font-semibold text-neutral-900 text-xs">
                            {used} / {max}
                          </span>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#E27625] rounded-full transition-all duration-300"
                              style={{ width: `${usagePercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Audience Badge */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                          {c.target_audience || "All customers"}
                        </span>
                      </td>

                      {/* Expiration Date */}
                      <td className="py-4 px-4 text-neutral-600 font-medium">
                        {c.expires_at
                          ? new Date(c.expires_at).toLocaleDateString("en-US")
                          : "8/31/2026"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {c.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Action Dropdown Menu */}
                      <td className="py-4 px-4 text-right relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === c.id ? null : c.id)
                          }
                          className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === c.id && (
                          <div className="absolute right-4 top-10 z-10 w-32 rounded-lg bg-white p-1 shadow-lg border border-neutral-200 text-left">
                            <button
                              onClick={() => {
                                setModal({ mode: "view", coupon: c });
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button
                              onClick={() => {
                                setModal({ mode: "edit", coupon: c });
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setPendingDelete(c);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
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

      {/* Modals & Dialogs */}
      {modal && (
        <CouponFormModal
          mode={modal.mode}
          coupon={modal.coupon}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            fetchItems();
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete coupon"
          message={`This will permanently delete the code "${pendingDelete.code}". This can't be undone.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}