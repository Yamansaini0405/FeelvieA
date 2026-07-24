import { useEffect, useState, useCallback, useMemo } from "react";
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
  Trash2,
} from "lucide-react";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import UserFormModal from "./UserFormModal";
import { listUsers, deleteUser } from "../../api/users";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Table State: Search, Sorting, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError("");
    listUsers()
      .then((res) => setUsers(res.data || []))
      .catch(() =>
        setError("Couldn't load users. Check your connection and try again.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(fetchUsers, [fetchUsers]);

  const handleSaved = () => {
    setModal(null);
    fetchUsers();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteUser(pendingDelete.id);
      setPendingDelete(null);
      fetchUsers();
    } catch {
      setDeleting(false);
    }
  };

  // 1. Search Logic
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((u) => {
      const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [users, searchQuery]);

  // 2. Sorting Logic
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortField === "name") {
        aValue = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
        bValue = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
      } else if (sortField === "email") {
        aValue = (a.email || "").toLowerCase();
        bValue = (b.email || "").toLowerCase();
      } else if (sortField === "role") {
        aValue = (a.role || "").toLowerCase();
        bValue = (b.role || "").toLowerCase();
      } else if (sortField === "status") {
        aValue = a.is_active ? "active" : "inactive";
        bValue = b.is_active ? "active" : "inactive";
      } else if (sortField === "joined") {
        aValue = a.date_joined ? new Date(a.date_joined).getTime() : 0;
        bValue = b.date_joined ? new Date(b.date_joined).getTime() : 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortOrder]);

  // 3. Pagination Logic
  const totalItems = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = useMemo(() => {
    return sortedUsers.slice(startIndex, startIndex + pageSize);
  }, [sortedUsers, startIndex, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Helper: Get Initials for Avatar
  const getInitials = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "US";
  };

  // CSV Export Functionality
  const exportCSV = () => {
    const headers = ["Name,Email,Phone,Role,Status,Verified,Joined\n"];
    const rows = sortedUsers.map((u) => {
      const name = `"${u.first_name || ""} ${u.last_name || ""}"`;
      const email = `"${u.email || ""}"`;
      const phone = `"${u.phone || "—"}"`;
      const role = `"${u.role || "customer"}"`;
      const status = u.is_active ? "Active" : "Inactive";
      const verified = u.is_verified ? "Verified" : "Pending";
      const joined = u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—";
      return [name, email, phone, role, status, verified, joined].join(",");
    });
    const blob = new Blob([headers.concat(rows).join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_directory.csv";
    a.click();
  };

  return (
    <div className=" max-w-[1400px] mx-auto space-y-6 bg-[#FAFAFA] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            CUSTOMER DIRECTORY
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 mt-0.5">
            Users
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Everyone with access to Feelvie. Manage roles, verification and lifecycle.
          </p>
        </div>
        <Button
          onClick={() => setModal({ mode: "create" })}
          className="!bg-neutral-950 hover:!bg-neutral-800 !text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add user
        </Button>
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
              placeholder="Search users by name, email, phone..."
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
                  className="py-3 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>User</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("email")}
                  className="py-3 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Email</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">PHONE</th>
                <th
                  onClick={() => handleSort("role")}
                  className="py-3 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Role</span>
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
                <th className="py-3 px-4">VERIFIED</th>
                <th
                  onClick={() => handleSort("joined")}
                  className="py-3 px-4 cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    <span>Joined</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-400">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const fullName =
                    u.first_name || u.last_name
                      ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                      : u.email.split("@")[0];

                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                      
                      {/* Avatar & User Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[11px] font-bold text-white">
                            {getInitials(u)}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">{fullName}</p>
                            <p className="text-[11px] text-neutral-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="py-3.5 px-4 text-neutral-600">{u.email}</td>
                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-neutral-800">
                        {u.phone || "—"}
                      </td>
                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100/60">
                          {u.role || "customer"}
                        </span>
                      </td>
                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {u.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {/* Verification Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          {u.is_verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-neutral-500">
                        {u.date_joined
                          ? new Date(u.date_joined).toLocaleDateString("en-US")
                          : "7/16/2026"}
                      </td>
                      {/* Action Menu Toggle */}
                      <td className="py-3.5 px-4 text-right relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === u.id ? null : u.id)
                          }
                          className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Dropdown Action Menu */}
                        {activeMenuId === u.id && (
                          <div className="absolute right-4 top-10 z-10 w-32 rounded-lg bg-white p-1 shadow-lg border border-neutral-200 text-left">
                            <button
                              onClick={() => {
                                setModal({ mode: "view", user: u });
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            <button
                              onClick={() => {
                                setModal({ mode: "edit", user: u });
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setPendingDelete(u);
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

      {/* Modals & Confirmation Dialogs */}
      {modal && (
        <UserFormModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete user"
          message={`This will permanently remove ${pendingDelete.email} from Feelvie. This can't be undone.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}