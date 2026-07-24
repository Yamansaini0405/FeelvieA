import { useState } from "react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { Field, Input } from "../../components/common/Input";
import { createCreditPack, updateCreditPack } from "../../api/credits";

const emptyForm = {
  name: "",
  price_inr: 0,
  credits: 0,
  is_active: true,
  sort_order: 0,
};

export default function CreditsFormModal({ mode, pack, onClose, onSaved }) {
  const [form, setForm] = useState(
    pack
      ? {
          name: pack.name || "",
          price_inr: pack.price_inr ?? 0,
          credits: pack.credits ?? 0,
          is_active: pack.is_active ?? true,
          sort_order: pack.sort_order ?? 0,
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.type === "number"
        ? Number(e.target.value)
        : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (mode === "edit") {
        await updateCreditPack(pack.id, form);
      } else {
        await createCreditPack(form);
      }
      onSaved();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't save this credit pack. Please check the fields and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={mode === "edit" ? "Edit credit pack" : "Create credit pack"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Pack name" required>
          <Input
            required
            value={form.name}
            onChange={set("name")}
            placeholder="e.g., Starter Pack"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹)" required>
            <Input
              type="number"
              required
              step="0.01"
              value={form.price_inr}
              onChange={set("price_inr")}
            />
          </Field>
          <Field label="Credits" required>
            <Input
              type="number"
              required
              min={0}
              value={form.credits}
              onChange={set("credits")}
            />
          </Field>
        </div>

        <Field label="Sort order">
          <Input
            type="number"
            value={form.sort_order}
            onChange={set("sort_order")}
            placeholder="Display order in list"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-ink-800">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={set("is_active")}
            className="h-4 w-4 rounded border-surface-200 text-brand-500 focus:ring-brand-100"
          />
          Active
        </label>

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {mode === "edit" ? "Save changes" : "Create pack"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
