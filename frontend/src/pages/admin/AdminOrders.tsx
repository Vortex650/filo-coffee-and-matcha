import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";

const STATUS_TABS = ["all", "pending", "awaiting_payment", "paid", "confirmed", "preparing", "ready", "completed", "cancelled"];

const NEXT: Record<string, { status: string; label: string }[]> = {
  pending: [{ status: "confirmed", label: "Confirm" }, { status: "cancelled", label: "Cancel" }],
  awaiting_payment: [{ status: "cancelled", label: "Cancel" }],
  paid: [{ status: "confirmed", label: "Confirm" }],
  confirmed: [{ status: "preparing", label: "Start Preparing" }],
  preparing: [{ status: "ready", label: "Mark Ready" }],
  ready: [{ status: "completed", label: "Complete" }],
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const [o, v] = await Promise.allSettled([
      api.get("/orders/"),
      api.get("/payments/verifications/?status=pending"),
    ]);
    if (o.status === "fulfilled") setOrders(o.value.data.results ?? o.value.data);
    if (v.status === "fulfilled") {
      const data = v.value.data.results ?? v.value.data;
      setVerifications(Array.isArray(data) ? data.filter((x: any) => x.status === "pending") : []);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    pending: orders.filter((o) => o.status === "pending").length,
    awaiting: orders.filter((o) => o.status === "awaiting_payment").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
  }), [orders]);

  const visible = useMemo(() => {
    const base = tab === "all" ? orders : orders.filter((o) => o.status === tab);
    const q = query.trim().toLowerCase();
    return q ? base.filter((o) => `${o.order_code} ${o.customer_name} ${o.customer_mobile}`.toLowerCase().includes(q)) : base;
  }, [orders, tab, query]);

  const transition = async (id: number, status: string) => {
    try {
      await api.post(`/orders/${id}/transition/`, { status });
      toast("Order updated.");
      load();
    } catch { toast("Could not update the order.", "error"); }
  };

  const approve = async (id: number) => {
    try {
      await api.post(`/payments/verifications/${id}/approve/`);
      toast("Payment verified.");
      load();
    } catch { toast("Could not verify the payment.", "error"); }
  };

  const reject = async (id: number) => {
    try {
      await api.post(`/payments/verifications/${id}/reject/`, { reason });
      setRejecting(null); setReason("");
      toast("Payment rejected.");
      load();
    } catch { toast("Could not reject the payment.", "error"); }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-4xl">Orders</h1>
        <button onClick={load} className="text-xs uppercase tracking-[0.15em] text-ink/65 hover:text-filo-red">Refresh</button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Pending", counts.pending], ["Awaiting payment", counts.awaiting], ["Preparing", counts.preparing], ["Ready", counts.ready]].map(([label, value]) => (
          <div key={label as string} className="border border-ink/10 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-ink/65">{label}</p>
            <p className="mt-1 font-heading text-2xl">{value}</p>
          </div>
        ))}
      </div>

      {verifications.length > 0 && (
        <section className="mt-8 border border-filo-red/30 bg-filo-red/5 p-5">
          <h2 className="font-heading text-xl">Payments to verify ({verifications.length})</h2>
          <div className="mt-4 space-y-3">
            {verifications.map((v) => (
              <div key={v.id} className="border border-ink/10 bg-filo-cream p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs text-ink/65">{v.order_code}</span>
                    <span className="ml-3">{v.customer_name}</span>
                    <span className="ml-3 text-ink/65">₱{v.total}</span>
                  </div>
                  <span className="text-xs text-ink/65">Ref: <span className="font-mono text-ink/80">{v.reference_number}</span></span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => approve(v.id)} className="bg-filo-red px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-filo-cream">Approve</button>
                  <button onClick={() => setRejecting(rejecting === v.id ? null : v.id)} className="border border-ink/20 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-ink/65">Reject</button>
                </div>
                {rejecting === v.id && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <label className="flex-1">
                      <span className="sr-only">Rejection reason</span>
                      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for rejection" className="w-full border border-ink/20 bg-transparent p-2 text-sm focus:border-filo-red focus:outline-none" />
                    </label>
                    <button onClick={() => reject(v.id)} className="bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-filo-cream">Confirm Rejection</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <label className="min-w-56 flex-1">
          <span className="sr-only">Search orders</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search code, name, or mobile…" className="w-full border-b border-ink/25 bg-transparent py-2 text-sm focus:border-filo-red focus:outline-none" />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select value={tab} onChange={(e) => setTab(e.target.value)} className="border border-ink/20 bg-transparent p-2 text-xs uppercase tracking-[0.12em]">
            {STATUS_TABS.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s.replace("_", " ")}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="space-y-3" aria-live="polite">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}
            <span className="sr-only">Loading orders</span>
          </div>
        )}
        {!loading && visible.map((o) => (
          <article key={o.id} className="border border-ink/10">
            <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left text-sm" aria-expanded={expanded === o.id}>
              <span className="font-mono text-xs">{o.order_code}</span>
              <span className="min-w-32">{o.customer_name}</span>
              <span className="text-ink/65 capitalize">{o.status.replace("_", " ")}</span>
              <span className={`text-xs ${o.payment_status === "pending_verification" ? "text-filo-red" : "text-ink/65"}`}>{o.payment_status.replace("_", " ")}</span>
              <span>₱{o.total}</span>
              <span className="text-ink/65">{new Date(o.created_at).toLocaleDateString()}</span>
              <span className="text-ink/65" aria-hidden>{expanded === o.id ? "−" : "+"}</span>
            </button>

            {expanded === o.id && (
              <div className="border-t border-ink/10 p-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Items</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      {o.items?.map((i: any) => (
                        <div key={i.id}>
                          <div className="flex justify-between gap-3">
                            <span>{i.quantity}× {i.product_name}{i.size_name ? ` · ${i.size_name}` : ""}</span>
                            <span className="text-ink/65">₱{i.line_total}</span>
                          </div>
                          <p className="text-xs text-ink/65">
                            {[i.hot_iced, i.milk && `${i.milk} milk`, i.sugar && `${i.sugar} sugar`, i.addons?.length ? i.addons.map((a: any) => a.name).join(", ") : ""].filter(Boolean).join(" · ")}
                          </p>
                          {i.notes && <p className="text-xs italic text-ink/65">“{i.notes}”</p>}
                        </div>
                      ))}
                    </div>
                    {o.notes && <p className="mt-3 border-l-2 border-filo-red pl-3 text-xs italic text-ink/65">{o.notes}</p>}
                  </div>

                  <div className="text-sm text-ink/65">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Details</h3>
                    <div className="mt-2 space-y-1">
                      <p>Mobile: {o.customer_mobile}</p>
                      {o.customer_email && <p>Email: {o.customer_email}</p>}
                      <p className="capitalize">Type: {o.order_type.replace("_", " ")}</p>
                      {o.pickup_time && <p>Pickup: {o.pickup_time}</p>}
                      {o.delivery_address && <p>Address: {o.delivery_address}</p>}
                      <p className="capitalize">Payment: {o.payment_method.replace("_", " ")}</p>
                      <div className="mt-2 border-t border-ink/10 pt-2">
                        <p>Subtotal ₱{o.subtotal}</p>
                        {Number(o.discount_total) > 0 && <p>Discounts −₱{o.discount_total}</p>}
                        {Number(o.tax_amount) > 0 && <p>Tax ₱{o.tax_amount}</p>}
                        {Number(o.service_fee) > 0 && <p>Service fee ₱{o.service_fee}</p>}
                        <p className="font-medium text-ink">Total ₱{o.total}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(NEXT[o.status] || []).map((n) => (
                        <button key={n.status} onClick={() => transition(o.id, n.status)}
                          className={`px-3 py-2 text-[11px] uppercase tracking-[0.15em] ${n.status === "cancelled" ? "border border-ink/20 text-ink/65" : "bg-filo-red text-filo-cream"}`}>
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
        {!loading && visible.length === 0 && (
          <EmptyState title="No orders in this view." copy="Try another status or search term." />
        )}
      </div>
    </div>
  );
}
