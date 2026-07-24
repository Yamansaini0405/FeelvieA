import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import CreditsFormModal from "./CreditsFormModal";
import { listCreditPacks } from "../../api/credits";

export default function CreditsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { mode, pack }

  const fetch = () => {
    setLoading(true);
    setError("");
    listCreditPacks()
      .then((res) => setItems(res.data))
      .catch(() => setError("Couldn't load credit packs."))
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const handleSaved = () => {
    setModal(null);
    fetch();
  };

  const columns = [
    {
      key: "name",
      header: "Pack",
      render: (p) => <p className="font-medium text-ink-950">{p.name}</p>,
    },
    {
      key: "price_inr",
      header: "Price",
      render: (p) => `₹${Number(p.price_inr).toLocaleString("en-IN")}`,
    },
    { key: "credits", header: "Credits" },
    { key: "effective_rate", header: "Effective rate" },
    {
      key: "is_active",
      header: "Status",
      render: (p) => (
        <Badge tone={p.is_active ? "ok" : "neutral"}>
          {p.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <button
          onClick={() => setModal({ mode: "edit", pack: p })}
          className="rounded-lg p-1.5 text-ink-800/50 hover:bg-surface-100 hover:text-brand-600"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Credit setting"
        description="Credit packs available for purchase."
        action={
          <Button
            icon={Plus}
            onClick={() => setModal({ mode: "create" })}
          >
            Add pack
          </Button>
        }
      />
      <div className="rounded-xl2 border border-surface-200 bg-white shadow-soft">
        <DataTable
          columns={columns}
          rows={items}
          loading={loading}
          error={error}
          emptyLabel="No credit packs configured yet."
        />
      </div>

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
