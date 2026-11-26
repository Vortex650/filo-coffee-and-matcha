import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { Container, Section } from "../../components/ui/Container";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
];

const NEXT: Record<string, { status: string; label: string }[]> = {
  pending: [{ status: "confirmed", label: "Confirm" }, { status: "cancelled", label: "Cancel" }],
  awaiting_payment: [{ status: "cancelled", label: "Cancel" }],
  paid: [{ status: "confirmed", label: "Confirm" }],
  confirmed: [{ status: "preparing", label: "Start Preparing" }],
  preparing: [{ status: "ready", label: "Mark Ready" }],
  ready: [{ status: "completed", label: "Complete" }],
};

function minutesAgo(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

export default function StaffOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    return api.get("/orders/")
      .then((r) => setOrders(r.data.results ?? r.data))
      .catch(() => toast("Could not load the order board.", "error"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); const id = setInterval(() => setTick((t) => t + 1), 30000); return () => clearInterval(id); }, []);

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
    } catch {
      toast("Could not update the order.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-filo-cream">
      <Section className="pt-14">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-heading text-4xl">Order Board</h1>
            <label>
              <span className="sr-only">Search orders</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search code, name, mobile…" className="w-64 border-b border-ink/25 bg-transparent py-2 text-sm focus:border-filo-red focus:outline-none" />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-2" role="tablist">
            {TABS.map((t) => (
              <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition ${tab === t.key ? "bg-filo-red text-filo-cream" : "border border-ink/15 text-ink/65 hover:border-ink/40"}`}>
                {t.label} {t.key !== "all" && `(${orders.filter((o) => o.status === t.key).length})`}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3" key={tick}>
            {loading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)}
            {!loading && visible.map((o) => {
              const mins = minutesAgo(o.created_at);
              return (
                <article key={o.id} className="flex flex-col border border-ink/10 bg-filo-cream p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs text-ink/65">{o.order_code}</p>
                      <p className="mt-1 font-heading text-xl">{o.customer_name}</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-[0.15em] ${mins >= 15 ? "bg-filo-red text-filo-cream" : "bg-ink/5 text-ink/65"}`}>{mins}m</span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-ink/70">
                    {o.items?.map((i: any) => (
                      <div key={i.id} className="flex justify-between gap-3">
                        <span>{i.quantity}× {i.product_name}{i.size_name ? ` · ${i.size_name}` : ""}{i.hot_iced ? ` · ${i.hot_iced}` : ""}</span>
                      </div>
                    ))}
                  </div>
                  {o.notes && <p className="mt-3 border-l-2 border-filo-red pl-3 text-xs italic text-ink/65">{o.notes}</p>}
                  <div className="mt-4 flex items-center justify-between text-xs text-ink/65">
                    <span className="capitalize">{o.status.replace("_", " ")}</span>
                    <span>₱{o.total} · {o.payment_method}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(NEXT[o.status] || []).map((n) => (
                      <button key={n.status} onClick={() => transition(o.id, n.status)}
                        className={`px-4 py-2 text-xs uppercase tracking-[0.15em] ${n.status === "cancelled" ? "border border-ink/20 text-ink/65" : "bg-filo-red text-filo-cream"}`}>
                        {n.label}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
          {!loading && visible.length === 0 && (
            <div className="mt-12">
              <EmptyState title="No orders in this view." copy="New orders will appear here as they come in." />
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
