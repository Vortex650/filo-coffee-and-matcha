import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../../services/api";
import { Container, Section } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { StarMark } from "../../components/brand/StarMark";

const STEPS = [
  { key: "pending", label: "Order Received" },
  { key: "awaiting_payment", label: "Payment Verification" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready for Pickup" },
  { key: "completed", label: "Completed" },
];

export default function TrackOrder() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (value = code) => {
    if (!value.trim()) return;
    setLoading(true); setError("");
    try {
      const r = await api.get(`/orders/track/?code=${encodeURIComponent(value.trim())}`);
      setOrder(r.data);
    } catch {
      setError("We couldn't find an order with that code.");
      setOrder(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const q = params.get("code");
    if (q) lookup(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelled = order?.status === "cancelled";
  const currentIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl">
            <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-filo-red"><StarMark className="h-3 w-3" /> Order Tracking</p>
            <h1 className="mt-4 font-heading text-5xl md:text-6xl">Where's my order?</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/65">Enter your order code to see the latest status from the café.</p>

            <form onSubmit={(e) => { e.preventDefault(); lookup(); }} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <label className="flex-1">
                <span className="sr-only">Order code</span>
                <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border border-ink/20 bg-transparent p-3 text-sm font-mono focus:border-filo-red focus:outline-none" placeholder="Order code" />
              </label>
              <Button type="submit" disabled={loading}>{loading ? "Looking…" : "Look Up"}</Button>
            </form>

            {error && <p className="mt-6 text-sm text-filo-red" role="alert">{error}</p>}

            {order && (
              <div className="mt-12">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Order</p>
                    <p className="mt-1 font-mono text-sm">{order.order_code}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Placed</p>
                    <p className="mt-1 text-sm">{new Date(order.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  {order.pickup_time && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Pickup</p>
                      <p className="mt-1 text-sm">{order.pickup_time}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Total</p>
                    <p className="mt-1 text-sm">₱{Number(order.total).toFixed(2)}</p>
                  </div>
                </div>

                {cancelled ? (
                  <div className="mt-8 border border-filo-red/30 bg-filo-red/5 p-6">
                    <p className="font-heading text-2xl text-filo-red">This order was cancelled.</p>
                    <p className="mt-2 text-sm text-ink/65">If you have questions, please speak with our team.</p>
                  </div>
                ) : (
                  <ol className="mt-8 space-y-0" aria-label="Order status timeline">
                    {STEPS.map((s, i) => {
                      const done = currentIndex >= i;
                      const active = currentIndex === i;
                      return (
                        <li key={s.key} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${done ? "border-filo-red bg-filo-red text-filo-cream" : "border-ink/20 text-ink/65"}`} aria-hidden>
                              {done ? "✓" : i + 1}
                            </span>
                            {i < STEPS.length - 1 && <span className={`w-px flex-1 ${currentIndex > i ? "bg-filo-red/50" : "bg-ink/10"}`} aria-hidden />}
                          </div>
                          <div className={`pb-7 ${active ? "text-ink" : done ? "text-ink/65" : "text-ink/65"}`}>
                            <p className={`text-sm ${active ? "font-medium" : ""}`}>{s.label}</p>
                            {active && <p className="mt-1 text-xs uppercase tracking-[0.15em] text-filo-red">Current status</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}

                <div className="mt-4 border-t border-ink/10 pt-6">
                  <h2 className="text-[11px] uppercase tracking-[0.2em] text-ink/65">Items</h2>
                  <div className="mt-3 space-y-2 text-sm text-ink/70">
                    {order.items?.map((i: any) => (
                      <div key={i.id} className="flex justify-between gap-4">
                        <span>{i.quantity}× {i.product_name}{i.size_name ? ` · ${i.size_name}` : ""}</span>
                        <span>₱{Number(i.line_total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to="/menu"><Button variant="secondary">Order Again</Button></Link>
                    <Link to="/contact"><Button variant="secondary">Contact the Café</Button></Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}
