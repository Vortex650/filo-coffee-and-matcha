import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Container, Section } from "../../components/ui/Container";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AdminReports() {
  const [sales, setSales] = useState<any>(null);
  const [products, setProducts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get("/reports/sales/?days=30").then((r) => setSales(r.data)),
      api.get("/reports/products/?days=30").then((r) => setProducts(r.data)),
    ]).then((results) => {
      if (results.some((r) => r.status === "rejected")) toast("Some report data could not be loaded.", "error");
    }).finally(() => setLoading(false));
  }, []);
  const downloadCsv = async () => {
    try {
      const res = await api.get("/reports/export_csv/?days=30", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url; a.download = "orders.csv"; a.click();
      URL.revokeObjectURL(url);
      toast("CSV export downloaded.");
    } catch {
      toast("Could not export the CSV.", "error");
    }
  };

  return (
    <div className="bg-filo-cream min-h-screen">
      <Section>
        <Container>
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-4xl">Reports</h1>
            <button onClick={downloadCsv} className="bg-filo-red px-4 py-2 text-xs uppercase tracking-[0.15em] text-filo-cream">Export CSV</button>
          </div>
          {loading && (
            <div className="mt-8 space-y-4" aria-live="polite">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
              <span className="sr-only">Loading reports</span>
            </div>
          )}
          {!loading && !sales && !products && (
            <div className="mt-8">
              <EmptyState title="Reports are unavailable right now." copy="Try refreshing in a moment." />
            </div>
          )}
          {!loading && sales && (
            <div className="mt-8 border border-ink/10 p-6">
              <p className="text-sm text-ink/65">Total ₱{sales.summary.total_sum} · Orders {sales.summary.count} · Avg ₱{sales.summary.avg_total}</p>
              <div className="mt-4 h-64" role="img" aria-label={`Sales over the last 30 days, total ${sales.summary.total_sum} pesos`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sales.by_day}>
                    <XAxis dataKey="d" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#59120C" strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {!loading && products && (
            <div className="mt-8 border border-ink/10 p-6">
              <h2 className="font-heading text-2xl">Top Products</h2>
              {products.top_products?.length ? (
                <div className="mt-4 h-64" role="img" aria-label="Top products by quantity sold in the last 30 days">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={products.top_products}>
                      <XAxis dataKey="product_name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="qty" fill="#59120C" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState title="No product sales yet." copy="Completed orders will populate this chart." />
                </div>
              )}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
