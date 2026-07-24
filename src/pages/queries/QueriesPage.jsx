import { useCallback, useEffect, useState, useMemo } from "react";
import {
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
import QueryFormModal from "./QueryFormModal";
import { listQueries } from "../../api/queries";

const getUserLabel = (user) => {
  if (!user) return "—";
  if (typeof user === "string") return user;
  if (typeof user === "object") return user.email || user.username || `User #${user.id ?? "—"}`;
  return String(user);
};

export default function QueriesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { id, mode, query }
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Search, Sorting, Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetch = useCallback(() => {
    setLoading(true);
    setError("");
    listQueries()
      .then((res) => setRows(res.data || []))
      .catch(() => setError("Couldn't load queries. Check connection and try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(fetch, [fetch]);

  // 1. Search Logic
  const filteredQueries = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const query = searchQuery.toLowerCase();
    return rows.filter((r) => {
      const userStr = getUserLabel(r.user).toLowerCase();
      const subjectStr = (r.subject || "").toLowerCase();
      const messageStr = (r.message || "").toLowerCase();
      return userStr.includes(query) || subjectStr.includes(query) || messageStr.includes(query);
    });
  }, [rows, searchQuery]);

  // 2. Sorting Logic
  const sortedQueries = useMemo(() => {
    return [...filteredQueries].sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortField === "user") {
        aValue = getUserLabel(a.user).toLowerCase();
        bValue = getUserLabel(b.user).toLowerCase();
      } else if (sortField === "subject") {
        aValue = (a.subject || "").toLowerCase();
        bValue = (b.subject || "").toLowerCase();
      } else if (sortField === "status") {
        aValue = (a.status || "").toLowerCase();
        bValue = (b.status || "").toLowerCase();
      } else if (sortField === "created_at") {
        aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
        bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredQueries, sortField, sortOrder]);

  // 3. Pagination Logic
  const totalItems = sortedQueries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedQueries = useMemo(() => {
    return sortedQueries.slice(startIndex, startIndex + pageSize);
  }, [sortedQueries, startIndex, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSaved = () => {
    setModal(null);
    fetch();
  };

  // CSV Export Functionality
  const exportCSV = () => {
    const headers = ["From,Created At,Subject,Message,Status\n"];
    const csvRows = sortedQueries.map((r) => {
      const user = `"${getUserLabel(r.user)}"`;
      const date = `"${r.created_at ? new Date(r.created_at).toLocaleString() : ""}"`;
      const subject = `"${r.subject || ""}"`;
      const message = `"${(r.message || "").replace(/"/g, '""')}"`;
      const status = `"${r.status || "Pending"}"`;
      return [user, date, subject, message, status].join(",");
    });
    const blob = new Blob([headers.concat(csvRows).join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "support_queries.csv";
    a.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 bg-[#FAFAFA] min-h-screen">
      {/* Header Section */}
      <div>
        <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
          SUPPORT
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 mt-0.5">
          Support queries
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          All messages from customers, with status and audit trail.
        </p>
      </div>

      {/* Toolbar: Search, Filters & Export */}
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
              placeholder="Search by subject, user, message..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950/10 focus:border-neutral-300"
            />
          </div>

          {/* Filters Button */}
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

      {/* Queries Data Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th
                  onClick={() => handleSort("user")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700 w-1/4"
                >
                  <div className="flex items-center gap-1">
                    <span>From</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("subject")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700 w-1/5"
                >
                  <div className="flex items-center gap-1">
                    <span>Subject</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-6 w-2/5">MESSAGE</th>
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
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    Loading support queries...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedQueries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    No support queries found.
                  </td>
                </tr>
              ) : (
                paginatedQueries.map((r) => {
                  const createdDate = r.created_at
                    ? new Date(r.created_at).toLocaleString("en-US", {
                        month: "numeric",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                        hour12: true,
                      })
                    : "7/17/2026, 1:12:30 PM";

                  return (
                    <tr key={r.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* From / User & Date */}
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-neutral-900">{getUserLabel(r.user)}</p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{createdDate}</p>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-6 font-semibold text-neutral-900">
                        {r.subject || "—"}
                      </td>

                      {/* Message Preview */}
                      <td className="py-4 px-6 text-neutral-500 max-w-md truncate">
                        {r.message || "—"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                            r.status === "resolved" || r.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-amber-50/80 text-amber-700 border-amber-200/60"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              r.status === "resolved" || r.status === "Resolved"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {r.status === "resolved" || r.status === "Resolved"
                            ? "Resolved"
                            : "Pending"}
                        </span>
                      </td>

                      {/* Actions Menu */}
                      <td className="py-4 px-6 text-right relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === r.id ? null : r.id)
                          }
                          className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Actions Context Menu */}
                        {activeMenuId === r.id && (
                          <div className="absolute right-6 top-10 z-10 w-32 rounded-lg bg-white p-1 shadow-lg border border-neutral-200 text-left">
                            <button
                              onClick={() => {
                                setModal({ mode: "view", id: r.id, query: r });
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button
                              onClick={() => {
                                setModal({ mode: "edit", query: r });
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit Status
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

        {/* Footer / Pagination Controls */}
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

      {/* Support Query Modal */}
      {modal && (
        <QueryFormModal
          id={modal.id}
          query={modal.query}
          mode={modal.mode}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}