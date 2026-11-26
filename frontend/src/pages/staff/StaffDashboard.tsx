import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { Container, Section } from "../../components/ui/Container";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";

export default function StaffDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  useEffect(() => {
    api.get("/orders/")
      .then((r) => setOrders(r.data.results ?? r.data))
      .catch(() => toast("Could not load the dashboard.", "error"))
      .finally(() => setLoading(false));
  }, []);
  const counts = orders.reduce((acc: any, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
  return (
    <div className="bg-filo-cream min-h-screen">
      <Section>
        <Container>
          <h1 className="font-heading text-4xl">Staff Dashboard</h1>
          {loading ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5" aria-live="polite">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
              <span className="sr-only">Loading dashboard</span>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(counts).map(([k, v]) => (
                <div key={k} className="border border-ink/10 p-6">
                  <p className="text-xs uppercase tracking-widest text-ink/65">{k.replace("_", " ")}</p>
                  <p className="mt-2 font-heading text-4xl">{String(v)}</p>
                </div>
              ))}
            </div>
          )}
          {!loading && orders.length === 0 && (
            <div className="mt-8">
              <EmptyState title="No orders yet." copy="New orders will appear on the board." />
            </div>
          )}
          <Link to="/staff/orders" className="mt-8 inline-block text-filo-red">View orders →</Link>
        </Container>
      </Section>
    </div>
  );
}
