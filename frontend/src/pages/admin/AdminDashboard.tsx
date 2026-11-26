import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [sales, setSales] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  useEffect(() => {
    Promise.allSettled([
      api.get("/orders/").then((r) => setOrders(r.data.results ?? r.data)),
      api.get("/reports/sales/?days=14").then((r) => setSales(r.data)),
    ]).then((results) => {
      if (results.some((r) => r.status === "rejected")) toast("Some dashboard data could not be loaded.", "error");
    }).finally(() => setLoading(false));
  }, []);
  const pending = orders.filter((o) => o.status === "pending" || o.status === "awaiting_payment").length;
  const unverified = orders.filter((o) => o.payment_status === "pending_verification").length;
  const kpis = [
    { label: "Sales (14d)", value: `₱${sales?.summary?.total_sum ?? 0}` },
    { label: "Orders", value: sales?.summary?.count ?? 0 },
    { label: "Avg order", value: `₱${sales?.summary?.avg_total ?? 0}` },
    { label: "Pending", value: pending },
    { label: "To verify", value: unverified },
  ];
  return (
    <div>
      <h1 className="font-heading text-4xl">Overview</h1>
      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-live="polite">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
          <span className="sr-only">Loading dashboard</span>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((k) => (
            <div key={k.label} className="border border-ink/10 p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink/65">{k.label}</p>
              <p className="mt-2 font-heading text-3xl">{k.value}</p>
            </div>
          ))}
        </div>
      )}
      {!loading && sales && (
        <div className="mt-8 border border-ink/10 p-6">
          <h2 className="font-heading text-2xl">Sales trend</h2>
          <div className="mt-4 h-64" role="img" aria-label="Sales trend over the last 14 days">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales.by_day}>
                <XAxis dataKey="d" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#59120C" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="mt-8 border border-ink/10 p-6">
        <h2 className="font-heading text-2xl">Recent orders</h2>
        {loading ? (
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No orders yet." copy="New orders will appear here." />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex justify-between border-b border-ink/10 pb-3 text-sm">
                <span className="font-mono text-xs">{o.order_code}</span>
                <span>{o.customer_name}</span>
                <span className="text-ink/65">{o.status}</span>
                <span>₱{o.total}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
