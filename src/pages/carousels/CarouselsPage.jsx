import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CarouselFormModal from "./CarouselFormModal";
import { listCarousels, deleteCarousel } from "../../api/carousels";

export default function CarouselsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    setError("");
    listCarousels()
      .then((res) => setItems(res.data))
      .catch(() => setError("Couldn't load carousel slides."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(fetchItems, [fetchItems]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCarousel(pendingDelete.id);
      setPendingDelete(null);
      fetchItems();
    } catch {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "image",
      header: "Slide",
      render: (c) => (
        <div className="flex items-center gap-3">
          {c.image ? (
            <img
              src={c.image}
              alt={c.title}
              className="h-10 w-16 rounded-md object-cover"
              onError={(e) => (e.target.style.visibility = "hidden")}
            />
          ) : (
            <div className="flex h-10 w-16 items-center justify-center rounded-md bg-surface-100 text-ink-800/30">
              <ImageOff className="h-4 w-4" />
            </div>
          )}
          <div>
            <p className="font-medium text-ink-950">{c.title}</p>
            <p className="max-w-xs truncate text-xs text-ink-800/40">
              {c.description}
            </p>
          </div>
        </div>
      ),
    },
    { key: "type", header: "Type", render: (c) => <Badge tone="brand">{c.type}</Badge> },
    { key: "order", header: "Order" },
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
            onClick={() => setModal({ mode: "edit", carousel: c })}
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
        title="Carousel setting"
        description="The banners shown on the Feelvie home carousel."
        action={
          <Button icon={Plus} onClick={() => setModal({ mode: "create" })}>
            Add slide
          </Button>
        }
      />

      <div className="rounded-xl2 border border-surface-200 bg-white shadow-soft">
        <DataTable
          columns={columns}
          rows={items}
          loading={loading}
          error={error}
          emptyLabel="No carousel slides yet."
        />
      </div>

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
