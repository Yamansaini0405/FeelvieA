import { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { getSubscriptionById } from "../../api/subscriptions";

export default function SubscriptionDetailModal({ subscriptionId, onClose }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subscriptionId) return;
    
    setLoading(true);
    setError("");
    
    getSubscriptionById(subscriptionId)
      .then((res) => setSubscription(res.data))
      .catch(() => setError("Failed to load subscription details. Please try again."))
      .finally(() => setLoading(false));
  }, [subscriptionId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: "text-emerald-500" };
      case "inactive":
      case "paused":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: "text-amber-500" };
      case "cancelled":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-100", icon: "text-red-500" };
      default:
        return { bg: "bg-neutral-50", text: "text-neutral-700", border: "border-neutral-100", icon: "text-neutral-500" };
    }
  };

  const statusColors = subscription ? getStatusColor(subscription.status) : {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg border border-neutral-200 mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-neutral-950">Subscription Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-950" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 border border-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          ) : subscription ? (
            <div className="space-y-6">
              {/* User & Plan Section */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase">User Email</p>
                    <p className="mt-1 text-sm font-medium text-neutral-900">{subscription.user_email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase">Plan Name</p>
                    <p className="mt-1 text-sm font-medium text-neutral-900">{subscription.plan.name}</p>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase">Status</p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${statusColors.icon}`} />
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase">Billing Cycle</p>
                    <p className="mt-2 text-sm font-medium text-neutral-900">
                      {subscription.plan.billing_cycle.charAt(0).toUpperCase() + subscription.plan.billing_cycle.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase">Auto Renew</p>
                    <p className="mt-2 flex items-center gap-1.5">
                      {subscription.auto_renew ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">Enabled</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-700">Disabled</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase">Audience</p>
                    <p className="mt-2 text-sm font-medium text-neutral-900 uppercase">
                      {subscription.plan.audience}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
                <p className="mb-4 text-xs font-semibold text-neutral-500 uppercase">Pricing Details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
                    <p className="text-xs text-neutral-500">Monthly Price</p>
                    <p className="mt-1 text-lg font-bold text-neutral-900">
                      ₹{Math.abs(parseFloat(subscription.plan.price_inr)).toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
                    <p className="text-xs text-neutral-500">Credits per Month</p>
                    <p className="mt-1 text-lg font-bold text-neutral-900">
                      {subscription.plan.credits_per_month.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
                    <p className="text-xs text-neutral-500">Extra Credit Price</p>
                    <p className="mt-1 text-lg font-bold text-neutral-900">
                      ₹{Math.abs(parseFloat(subscription.plan.extra_credit_price_inr)).toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
                    <p className="text-xs text-neutral-500">Plan Status</p>
                    <p className="mt-1 text-sm font-semibold">
                      {subscription.plan.is_active ? (
                        <span className="text-emerald-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Section */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
                <p className="mb-4 text-xs font-semibold text-neutral-500 uppercase">Timeline</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-neutral-500">Started At</p>
                    <p className="mt-2 text-sm font-medium text-neutral-900">
                      {new Date(subscription.started_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Current Period Ends</p>
                    <p className="mt-2 text-sm font-medium text-neutral-900">
                      {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Created At</p>
                    <p className="mt-2 text-sm font-medium text-neutral-700">
                      {new Date(subscription.created_at).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Last Updated</p>
                    <p className="mt-2 text-sm font-medium text-neutral-700">
                      {new Date(subscription.updated_at).toLocaleDateString("en-US")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Razorpay Info */}
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
                <p className="mb-3 text-xs font-semibold text-neutral-500 uppercase">Razorpay Information</p>
                <div className="space-y-2">
                  <div className="break-all text-xs">
                    <p className="text-neutral-500">Subscription ID:</p>
                    <p className="font-mono text-neutral-700">{subscription.razorpay_subscription_id}</p>
                  </div>
                  <div className="break-all text-xs">
                    <p className="text-neutral-500">Plan ID:</p>
                    <p className="font-mono text-neutral-700">{subscription.plan.razorpay_plan_id}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 bg-neutral-50/50 px-6 py-3">
          <button
            onClick={onClose}
            className="ml-auto flex items-center px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
