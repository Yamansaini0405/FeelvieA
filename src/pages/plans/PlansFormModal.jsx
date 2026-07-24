import { useState } from "react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { Field, Input, Select } from "../../components/common/Input";
import { createPlan, updatePlan } from "../../api/plans";

const AUDIENCES = ["b2c", "b2b"];
const BILLING_CYCLES = ["monthly", "yearly"];

const emptyForm = {
  name: "",
  audience: "b2c",
  billing_cycle: "monthly",
  price_inr: 0,
  credits_per_month: 0,
  extra_credit_price_inr: 0,
  razorpay_plan_id: "",
  razorpay_plan_meta: "",
  is_active: true,
};

export default function PlansFormModal({ mode, plan, onClose, onSaved }) {
  const [form, setForm] = useState(
    plan
      ? {
          name: plan.name || "",
          audience: plan.audience || "b2c",
          billing_cycle: plan.billing_cycle || "monthly",
          price_inr: plan.price_inr ?? 0,
          credits_per_month: plan.credits_per_month ?? 0,
          extra_credit_price_inr: plan.extra_credit_price_inr ?? 0,
          razorpay_plan_id: plan.razorpay_plan_id || "",
          razorpay_plan_meta: plan.razorpay_plan_meta || "",
          is_active: plan.is_active ?? true,
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
        await updatePlan(plan.id, form);
      } else {
        await createPlan(form);
      }
      onSaved();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Couldn't save this plan. Please check the fields and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={mode === "edit" ? "Edit plan" : "Create plan"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-2">
        <Field label="Plan name" required>
          <Input
            required
            value={form.name}
            onChange={set("name")}
            placeholder="e.g., Premium Monthly"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Audience" required>
            <Select value={form.audience} onChange={set("audience")}>
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {a.toUpperCase()}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Billing cycle" required>
            <Select value={form.billing_cycle} onChange={set("billing_cycle")}>
              {BILLING_CYCLES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

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
          <Field label="Credits per month" required>
            <Input
              type="number"
              required
              min={0}
              value={form.credits_per_month}
              onChange={set("credits_per_month")}
            />
          </Field>
        </div>

        <Field label="Extra credit price (₹)" required>
          <Input
            type="number"
            required
            step="0.01"
            value={form.extra_credit_price_inr}
            onChange={set("extra_credit_price_inr")}
          />
        </Field>

        <Field label="Razorpay plan ID">
          <Input
            value={form.razorpay_plan_id}
            onChange={set("razorpay_plan_id")}
            placeholder="plan_xxxxx"
          />
        </Field>

        <Field label="Razorpay plan meta">
          <Input
            value={form.razorpay_plan_meta}
            onChange={set("razorpay_plan_meta")}
            placeholder="Extra metadata"
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
            {mode === "edit" ? "Save changes" : "Create plan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
