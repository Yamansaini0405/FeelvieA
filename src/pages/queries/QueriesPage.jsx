import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import Badge from "../../components/common/Badge";
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
  const [modal, setModal] = useState(null); // { id, mode }

  const fetch = useCallback(() => {
    setLoading(true);
    setError("");
    listQueries()
      .then((res) => setRows(res.data))
      .catch(() => setError("Couldn't load queries. Check connection and try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(fetch, [fetch]);

  const columns = [
    {
      key: "user",
      header: "From",
      render: (r) => (
        <div>
          <p className="font-medium text-ink-950">{getUserLabel(r.user)}</p>
          <p className="text-xs text-ink-800/40">{new Date(r.created_at).toLocaleString()}</p>
        </div>
      ),
    },
    { key: "subject", header: "Subject", render: (r) => r.subject || "—" },
    {
      key: "message",
      header: "Message",
      render: (r) => (r.message ? `${r.message.slice(0, 80)}${r.message.length > 80 ? "…" : ""}` : "—"),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge tone={r.status === "pending" ? "warn" : "ok"}>
          {r.status === "pending" ? "Pending" : "Resolved"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            title="View"
            onClick={() => setModal({ mode: "view", id: r.id })}
            className="rounded-lg p-1.5 text-ink-800/50 hover:bg-surface-100 hover:text-ink-950"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            title="Edit status"
            onClick={() => setModal({ mode: "edit", query: r })}
            className="rounded-lg p-1.5 text-ink-800/50 hover:bg-surface-100 hover:text-brand-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleSaved = () => {
    setModal(null);
    fetch();
  };

  return (
    <div>
      <PageHeader title="Queries" description="Customer queries and messages." />

      <div className="rounded-xl2 border border-surface-200 bg-white shadow-soft">
        <DataTable columns={columns} rows={rows} loading={loading} error={error} emptyLabel="No queries yet." />
      </div>

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
