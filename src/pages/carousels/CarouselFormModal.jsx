import { useState } from "react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { Field, Input, Select, Textarea } from "../../components/common/Input";
import { createCarousel, updateCarousel } from "../../api/carousels";

const TYPES = ["APP", "WEB"];

const emptyForm = {
  image: "",
  title: "",
  description: "",
  redirect_url: "",
  type: "APP",
  is_active: true,
  order: 0,
};

export default function CarouselFormModal({ mode, carousel, onClose, onSaved }) {
  const [form, setForm] = useState(
    carousel
      ? {
          image: carousel.image || "",
          title: carousel.title || "",
          description: carousel.description || "",
          redirect_url: carousel.redirect_url || "",
          type: carousel.type || "APP",
          is_active: carousel.is_active ?? true,
          order: carousel.order ?? 0,
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
        await updateCarousel(carousel.id, form);
      } else {
        await createCarousel(form);
      }
      onSaved();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't save this carousel slide. Please check the fields and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={mode === "edit" ? "Edit carousel slide" : "Add carousel slide"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Image URL" required>
          <Input
            required
            placeholder="https://…"
            value={form.image}
            onChange={set("image")}
          />
        </Field>

        <Field label="Title" required>
          <Input required value={form.title} onChange={set("title")} />
        </Field>

        <Field label="Description">
          <Textarea value={form.description} onChange={set("description")} />
        </Field>

        <Field label="Redirect URL">
          <Input
            placeholder="https://…"
            value={form.redirect_url}
            onChange={set("redirect_url")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <Select value={form.type} onChange={set("type")}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Order" hint="Lower shows first">
            <Input
              type="number"
              value={form.order}
              onChange={set("order")}
            />
          </Field>
        </div>

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
            {mode === "edit" ? "Save changes" : "Add slide"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
