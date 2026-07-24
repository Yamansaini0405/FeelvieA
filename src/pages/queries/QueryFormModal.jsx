import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { Field, Select, Textarea, Input } from "../../components/common/Input";
import { updateQuery, getQuery } from "../../api/queries";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
];

const getUserLabel = (user) => {
  if (!user) return "—";
  if (typeof user === "string") return user;
  if (typeof user === "object") return user.email || user.username || `User #${user.id ?? "—"}`;
  return String(user);
};

export default function QueryFormModal({ mode = "view", id, query, onClose, onSaved }) {
  const [form, setForm] = useState({ subject: "", message: "", user: "", status: "pending" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query) {
      setForm({ subject: query.subject || "", message: query.message || "", user: getUserLabel(query.user), status: query.status || "pending" });
      return;
    }

    if (id) {
      setLoading(true);
      setError("");
      getQuery(id)
        .then((res) =>
          setForm({
            subject: res.data.subject || "",
            message: res.data.message || "",
            user: getUserLabel(res.data.user),
            status: res.data.status || "pending",
          })
        )
        .catch(() => setError("Couldn't load query"))
        .finally(() => setLoading(false));
    }
  }, [id, query]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e && e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateQuery(id || query.id, { status: form.status });
      onSaved && onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't update query. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={mode === "view" ? "View query" : "Edit query"} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        {loading ? (
          <p className="py-6 text-sm text-ink-800/50">Loading query…</p>
        ) : null}
        <Field label="From">
          <Input readOnly value={form.user} />
        </Field>

        <Field label="Subject">
          <Input readOnly value={form.subject} />
        </Field>

        <Field label="Message">
          <Textarea readOnly value={form.message} />
        </Field>

        <Field label="Status">
          <Select value={form.status} onChange={set("status")}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" loading={saving}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
