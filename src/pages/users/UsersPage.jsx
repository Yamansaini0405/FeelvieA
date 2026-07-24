import { useEffect, useState, useCallback } from "react";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import UserFormModal from "./UserFormModal";
import { listUsers, deleteUser } from "../../api/users";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { mode, user }
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError("");
    listUsers()
      .then((res) => setUsers(res.data))
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
    setDeleting(true);
    try {
      await deleteUser(pendingDelete.id);
      setPendingDelete(null);
      fetchUsers();
    } catch {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <div>
          <p className="font-medium text-ink-950">
            {u.first_name || u.last_name
              ? `${u.first_name} ${u.last_name}`.trim()
              : "—"}
          </p>
          <p className="text-xs text-ink-800/40">{u.email}</p>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (u) => u.phone || "—" },
    {
      key: "role",
      header: "Role",
      render: (u) => <Badge tone="brand">{u.role}</Badge>,
    },
    {
      key: "is_active",
      header: "Status",
      render: (u) => (
        <Badge tone={u.is_active ? "ok" : "neutral"}>
          {u.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "is_verified",
      header: "Verified",
      render: (u) => (
        <Badge tone={u.is_verified ? "ok" : "warn"}>
          {u.is_verified ? "Verified" : "Unverified"}
        </Badge>
      ),
    },
    {
      key: "date_joined",
      header: "Joined",
      render: (u) =>
        u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—",
    },
    {
      key: "actions",
      header: "",
      render: (u) => (
        <div className="flex items-center gap-1">
          <button
            title="View"
            onClick={() => setModal({ mode: "view", user: u })}
            className="rounded-lg p-1.5 text-ink-800/50 hover:bg-surface-100 hover:text-ink-950"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            title="Edit"
            onClick={() => setModal({ mode: "edit", user: u })}
            className="rounded-lg p-1.5 text-ink-800/50 hover:bg-surface-100 hover:text-brand-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            title="Delete"
            onClick={() => setPendingDelete(u)}
            className="rounded-lg p-1.5 text-ink-800/50 hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Everyone with access to Feelvie, and their account status."
        action={
          <Button icon={Plus} onClick={() => setModal({ mode: "create" })}>
            Add user
          </Button>
        }
      />

      <div className="rounded-xl2 border border-surface-200 bg-white shadow-soft">
        <DataTable
          columns={columns}
          rows={users}
          loading={loading}
          error={error}
          emptyLabel="No users yet. Add your first one to get started."
        />
      </div>

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
