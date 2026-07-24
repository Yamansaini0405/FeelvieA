import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import Button from "../../components/common/Button";
import CreditsFormModal from "./CreditsFormModal";
import { listCreditPacks } from "../../api/credits";

export default function CreditsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { mode, pack }
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Table Controls State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCreditPacks = () => {
    setLoading(true);
    setError("");
    listCreditPacks()
      .then((res) => setItems(res.data || []))
      .catch(() => setError("Couldn't load credit packs."))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCreditPacks, []);

  const handleSaved = () => {
    setModal(null);
    fetchCreditPacks();
  };

  // 1. Search Logic
  const filteredPacks = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const sortOrderStr = String(p.sort_order ?? "");
      return name.includes(query) || sortOrderStr.includes(query);
    });
  }, [items, searchQuery]);

  // 2. Sorting Logic
  const sortedPacks = useMemo(() => {
    return [...filteredPacks].sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortField === "name") {
        aValue = (a.name || "").toLowerCase();
        bValue = (b.name || "").toLowerCase();
      } else if (sortField === "price") {
        aValue = Number(a.price_inr || 0);
        bValue = Number(b.price_inr || 0);
      } else if (sortField === "credits") {
        aValue = Number(a.credits || 0);
        bValue = Number(b.credits || 0);
      } else if (sortField === "status") {
        aValue = a.is_active ? "active" : "inactive";
        bValue = b.is_active ? "active" : "inactive";
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredPacks, sortField, sortOrder]);

  // 3. Pagination Logic
  const totalItems = sortedPacks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPacks = useMemo(() => {
    return sortedPacks.slice(startIndex, startIndex + pageSize);
  }, [sortedPacks, startIndex, pageSize]);

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
    const headers = ["Pack,Sort Order,Price (INR),Credits,Effective Rate,Status\n"];
    const csvRows = sortedPacks.map((p) => {
      const name = `"${p.name || ""}"`;
      const sortOrd = `"${p.sort_order ?? 0}"`;
      const price = `"${p.price_inr || 0}"`;
      const credits = `"${p.credits || 0}"`;
      const effRate = p.credits
        ? (Number(p.price_inr) / Number(p.credits)).toFixed(2)
        : "0.00";
      const status = p.is_active ? "Active" : "Inactive";
      return [name, sortOrd, price, credits, effRate, status].join(",");
    });
    const blob = new Blob([headers.concat(csvRows).join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "credit_packs.csv";
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
            Credit packs
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            One-time credit purchases available to customers.
          </p>
        </div>
        <Button
          onClick={() => setModal({ mode: "create" })}
          className="!bg-neutral-950 hover:!bg-neutral-800 !text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add pack
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
              placeholder="Search credit packs..."
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
                  onClick={() => handleSort("name")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700 w-1/3"
                >
                  <div className="flex items-center gap-1">
                    <span>Pack</span>
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
                    <span>Credits</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-6">EFFECTIVE RATE</th>
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
                  <td colSpan={6} className="py-8 text-center text-neutral-400">
                    Loading credit packs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedPacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400">
                    No credit packs found.
                  </td>
                </tr>
              ) : (
                paginatedPacks.map((p) => {
                  const effectiveRate =
                    p.effective_rate ||
                    (p.credits
                      ? (Number(p.price_inr) / Number(p.credits)).toFixed(2)
                      : "0.00");

                  return (
                    <tr key={p.id || p.name} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Pack Title & Icon */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 border border-orange-100/60 text-[#E27625]">
                            <Zap className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">{p.name}</p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              Sort order {p.sort_order ?? 0}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-semibold text-neutral-900">
                        ₹{Number(p.price_inr || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Credits Amount */}
                      <td className="py-4 px-6 text-neutral-900 font-semibold">
                        {p.credits}
                      </td>

                      {/* Effective Rate */}
                      <td className="py-4 px-6 text-neutral-500 font-medium">
                        {effectiveRate}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {p.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Action Dropdown Menu */}
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
                                setModal({ mode: "view", pack: p });
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button
                              onClick={() => {
                                setModal({ mode: "edit", pack: p });
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

      {/* Credit Pack Modal */}
      {modal && (
        <CreditsFormModal
          mode={modal.mode}
          pack={modal.pack}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}