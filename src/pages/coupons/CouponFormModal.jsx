import { useState } from "react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { Field, Input, Select, Textarea } from "../../components/common/Input";
import { createCoupon, updateCoupon } from "../../api/coupons";

const AUDIENCES = ["all", "specific"];

const emptyForm = {
  code: "",
  credit_value: 0,
  max_uses: 1,
  expires_at: "",
  target_audience: "all",
  allowed_emails: "",
  is_active: true,
};

export default function CouponFormModal({ mode, coupon, onClose, onSaved }) {
  const [form, setForm] = useState(
    coupon
      ? {
          code: coupon.code || "",
          credit_value: coupon.credit_value ?? 0,
          max_uses: coupon.max_uses ?? 1,
          expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : "",
          target_audience: coupon.target_audience || "all",
          allowed_emails: coupon.allowed_emails || "",
          is_active: coupon.is_active ?? true,
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
      const payload = { ...form, code: form.code.toUpperCase() };
      if (mode === "edit") {
        await updateCoupon(coupon.id, payload);
      } else {
        await createCoupon(payload);
      }
      onSaved();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't save this coupon. Please check the fields and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={mode === "edit" ? "Edit coupon" : "Create coupon"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Coupon code" required hint="Shown to customers, e.g. WELCOME50">
          <Input
            required
            value={form.code}
            onChange={set("code")}
            className="uppercase"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Credit value" required>
            <Input
              type="number"
              required
              min={0}
              value={form.credit_value}
              onChange={set("credit_value")}
            />
          </Field>
          <Field label="Max uses" required>
            <Input
              type="number"
              required
              min={1}
              value={form.max_uses}
              onChange={set("max_uses")}
            />
          </Field>
        </div>

        <Field label="Expires on" hint="Leave blank for no expiry">
          <Input type="date" value={form.expires_at} onChange={set("expires_at")} />
        </Field>

        <Field label="Audience">
          <Select value={form.target_audience} onChange={set("target_audience")}>
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a === "all" ? "All customers" : "Specific emails"}
              </option>
            ))}
          </Select>
        </Field>

        {form.target_audience === "specific" && (
          <Field label="Allowed emails" hint="Comma-separated list">
            <Textarea
              value={form.allowed_emails}
              onChange={set("allowed_emails")}
              placeholder="jane@example.com, sam@example.com"
            />
          </Field>
        )}

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
            {mode === "edit" ? "Save changes" : "Create coupon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
