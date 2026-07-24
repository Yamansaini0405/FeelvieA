import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CouponFormModal from "./CouponFormModal";
import { listCoupons, deleteCoupon } from "../../api/coupons";

export default function CouponsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    setError("");
    listCoupons()
      .then((res) => setItems(res.data))
      .catch(() => setError("Couldn't load coupons."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(fetchItems, [fetchItems]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCoupon(pendingDelete.id);
      setPendingDelete(null);
      fetchItems();
    } catch {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (c) => <span className="font-mono font-medium text-ink-950">{c.code}</span>,
    },
    { key: "credit_value", header: "Credit value" },
    {
      key: "usage",
      header: "Usage",
      render: (c) => `${c.used_count ?? 0} / ${c.max_uses}`,
    },
    {
      key: "target_audience",
      header: "Audience",
      render: (c) => <Badge tone="brand">{c.target_audience}</Badge>,
    },
    {
      key: "expires_at",
      header: "Expires",
      render: (c) =>
        c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never",
    },
    {
      key: "is_active",
      header: "Status",
      render: (c) => (
        <Badge tone={c.is_active ? "ok" : "neutral"}>
          {c.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex items-center gap-1">
          <button
            title="Edit"
            onClick={() => setModal({ mode: "edit", coupon: c })}
            className="rounded-lg p-1.5 text-ink-800/50 hover:bg-surface-100 hover:text-brand-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            title="Delete"
            onClick={() => setPendingDelete(c)}
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
        title="Coupons"
        description="Discount and credit codes available to Feelvie customers."
        action={
          <Button icon={Plus} onClick={() => setModal({ mode: "create" })}>
            Create coupon
          </Button>
        }
      />

      <div className="rounded-xl2 border border-surface-200 bg-white shadow-soft">
        <DataTable
          columns={columns}
          rows={items}
          loading={loading}
          error={error}
          emptyLabel="No coupons yet."
        />
      </div>

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
