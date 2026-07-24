import { useState } from "react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { Field, Input, Select } from "../../components/common/Input";
import { createUser, updateUser } from "../../api/users";

const ROLES = ["admin", "staff", "user"];

const emptyForm = {
  email: "",
  phone: "",
  first_name: "",
  last_name: "",
  role: "user",
  is_active: true,
  is_verified: false,
};

export default function UserFormModal({ mode, user, onClose, onSaved }) {
  const readOnly = mode === "view";
  const [form, setForm] = useState(
    user
      ? {
          email: user.email || "",
          phone: user.phone || "",
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          role: user.role || "user",
          is_active: user.is_active ?? true,
          is_verified: user.is_verified ?? false,
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return onClose();
    setSaving(true);
    setError("");
    try {
      if (mode === "edit") {
        await updateUser(user.id, form);
      } else {
        await createUser(form);
      }
      onSaved();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Couldn't save this user. Please check the fields and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const titles = {
    create: "Add user",
    edit: "Edit user",
    view: "User details",
  };

  return (
    <Modal title={titles[mode]} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name">
            <Input
              value={form.first_name}
              onChange={set("first_name")}
              disabled={readOnly}
            />
          </Field>
          <Field label="Last name">
            <Input
              value={form.last_name}
              onChange={set("last_name")}
              disabled={readOnly}
            />
          </Field>
        </div>

        <Field label="Email" required>
          <Input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            disabled={readOnly}
          />
        </Field>

        <Field label="Phone">
          <Input value={form.phone} onChange={set("phone")} disabled={readOnly} />
        </Field>

        <Field label="Role">
          <Select value={form.role} onChange={set("role")} disabled={readOnly}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={set("is_active")}
              disabled={readOnly}
              className="h-4 w-4 rounded border-surface-200 text-brand-500 focus:ring-brand-100"
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <input
              type="checkbox"
              checked={form.is_verified}
              onChange={set("is_verified")}
              disabled={readOnly}
              className="h-4 w-4 rounded border-surface-200 text-brand-500 focus:ring-brand-100"
            />
            Verified
          </label>
        </div>

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly && (
            <Button type="submit" loading={saving}>
              {mode === "edit" ? "Save changes" : "Add user"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
