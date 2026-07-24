import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  ArrowUpDown,
  MoreHorizontal,
  ImageOff,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CarouselFormModal from "./CarouselFormModal";
import { listCarousels, deleteCarousel } from "../../api/carousels";

export default function CarouselsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { mode, carousel }
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Table Control States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("order");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchItems = useCallback(() => {
    setLoading(true);
    setError("");
    listCarousels()
      .then((res) => setItems(res.data || []))
      .catch(() => setError("Couldn't load carousel slides."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(fetchItems, [fetchItems]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCarousel(pendingDelete.id);
      setPendingDelete(null);
      fetchItems();
    } catch {
      setDeleting(false);
    }
  };

  // 1. Search Logic
  const filteredCarousels = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((c) => {
      const title = (c.title || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      const type = (c.type || "").toLowerCase();
      return title.includes(query) || desc.includes(query) || type.includes(query);
    });
  }, [items, searchQuery]);

  // 2. Sorting Logic
  const sortedCarousels = useMemo(() => {
    return [...filteredCarousels].sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortField === "slide") {
        aValue = (a.title || "").toLowerCase();
        bValue = (b.title || "").toLowerCase();
      } else if (sortField === "type") {
        aValue = (a.type || "").toLowerCase();
        bValue = (b.type || "").toLowerCase();
      } else if (sortField === "order") {
        aValue = Number(a.order ?? 0);
        bValue = Number(b.order ?? 0);
      } else if (sortField === "status") {
        aValue = a.is_active ? "active" : "inactive";
        bValue = b.is_active ? "active" : "inactive";
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredCarousels, sortField, sortOrder]);

  // 3. Pagination Logic
  const totalItems = sortedCarousels.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCarousels = useMemo(() => {
    return sortedCarousels.slice(startIndex, startIndex + pageSize);
  }, [sortedCarousels, startIndex, pageSize]);

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
    const headers = ["Title,Description,Type,Order,Status\n"];
    const csvRows = sortedCarousels.map((c) => {
      const title = `"${c.title || ""}"`;
      const desc = `"${(c.description || "").replace(/"/g, '""')}"`;
      const type = `"${c.type || "APP"}"`;
      const order = `"${c.order ?? 0}"`;
      const status = c.is_active ? "Active" : "Inactive";
      return [title, desc, type, order, status].join(",");
    });
    const blob = new Blob([headers.concat(csvRows).join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "carousel_slides.csv";
    a.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 bg-[#FAFAFA] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            CONTENT
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 mt-0.5">
            Carousel
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Home banner slides shown to Feelvie customers.
          </p>
        </div>
        <Button
          onClick={() => setModal({ mode: "create" })}
          className="!bg-neutral-950 hover:!bg-neutral-800 !text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add slide
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
              placeholder="Search slides..."
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
                <th
                  onClick={() => handleSort("slide")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700 w-1/2"
                >
                  <div className="flex items-center gap-1">
                    <span>Slide</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("type")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Type</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("order")}
                  className="py-3.5 px-6 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Order</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
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
                    Loading slides...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedCarousels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    No slides found.
                  </td>
                </tr>
              ) : (
                paginatedCarousels.map((c) => (
                  <tr key={c.id || c.title} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Slide Thumbnail & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.title}
                            className="h-12 w-20 rounded-md object-cover border border-neutral-200/80 shadow-xs"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-20 items-center justify-center rounded-md bg-neutral-100 text-neutral-400 border border-neutral-200/80">
                            <ImageOff className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-neutral-900">{c.title}</p>
                          <p className="text-[11px] text-neutral-400 capitalize mt-0.5">
                            {c.description || "App carousel"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                        {(c.type || "APP").toUpperCase()}
                      </span>
                    </td>

                    {/* Sort Order */}
                    <td className="py-4 px-6 font-semibold text-neutral-900">
                      {c.order ?? 1}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {c.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Action Dropdown */}
                    <td className="py-4 px-6 text-right relative">
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
                        <div className="absolute right-6 top-10 z-10 w-32 rounded-lg bg-white p-1 shadow-lg border border-neutral-200 text-left">
                          <button
                            onClick={() => {
                              setModal({ mode: "view", carousel: c });
                              setActiveMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                          <button
                            onClick={() => {
                              setModal({ mode: "edit", carousel: c });
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
                ))
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

      {/* Modals */}
      {modal && (
        <CarouselFormModal
          mode={modal.mode}
          carousel={modal.carousel}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            fetchItems();
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete slide"
          message={`This will remove "${pendingDelete.title}" from the carousel. This can't be undone.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}