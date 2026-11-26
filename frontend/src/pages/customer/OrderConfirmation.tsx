import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { Container, Section } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { StarMark } from "../../components/brand/StarMark";

export default function OrderConfirmation() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [ref, setRef] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/orders/track/?code=${code}`).then((r) => setOrder(r.data)).catch(() => setError("Order not found."));
  }, [code]);

  const submitReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    try {
      await api.post("/payments/verifications/", { order_code: order.order_code, reference_number: ref });
      setSent(true);
    } catch {
      setError("Could not submit the reference. Please try again.");
    }
  };

  if (error) return <div className="flex min-h-screen items-center justify-center bg-filo-cream"><p className="text-sm text-ink/65">{error}</p></div>;
  if (!order) return <div className="flex min-h-screen items-center justify-center bg-filo-cream"><p className="text-xs uppercase tracking-[0.25em] text-ink/65">Loading…</p></div>;

  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl">
            <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-filo-red"><StarMark className="h-3 w-3" /> Confirmed</p>
            <h1 className="mt-5 font-heading text-5xl md:text-6xl">Order received.</h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/65">
              Thank you, {order.customer_name}. We're preparing your order with care.
            </p>

            <div className="mt-10 border border-ink/10">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 p-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Order code</p>
                  <p className="mt-1 font-mono text-sm">{order.order_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Status</p>
                  <p className="mt-1 text-sm capitalize">{order.status.replace("_", " ")}</p>
                </div>
                {order.pickup_time && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Pickup</p>
                    <p className="mt-1 text-sm">{order.pickup_time}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 p-5 text-sm">
                {order.items?.map((i: any) => (
                  <div key={i.id} className="flex justify-between gap-4">
                    <span>{i.quantity}× {i.product_name}{i.size_name ? ` · ${i.size_name}` : ""}{i.hot_iced ? ` · ${i.hot_iced}` : ""}</span>
                    <span className="whitespace-nowrap text-ink/70">₱{Number(i.line_total).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-ink/10 p-5 text-sm text-ink/65">
                <div className="flex justify-between"><span>Subtotal</span><span>₱{Number(order.subtotal).toFixed(2)}</span></div>
                {Number(order.discount_total) > 0 && <div className="flex justify-between"><span>Discounts</span><span>−₱{Number(order.discount_total).toFixed(2)}</span></div>}
                {Number(order.tax_amount) > 0 && <div className="flex justify-between"><span>Tax</span><span>₱{Number(order.tax_amount).toFixed(2)}</span></div>}
                {Number(order.service_fee) > 0 && <div className="flex justify-between"><span>Service fee</span><span>₱{Number(order.service_fee).toFixed(2)}</span></div>}
                {Number(order.delivery_fee) > 0 && <div className="flex justify-between"><span>Delivery</span><span>₱{Number(order.delivery_fee).toFixed(2)}</span></div>}
                <div className="flex justify-between border-t border-ink/10 pt-3 font-heading text-lg text-ink"><span>Total</span><span>₱{Number(order.total).toFixed(2)}</span></div>
              </div>
            </div>

            {order.payment_status === "pending_verification" && !sent && (
              <div className="mt-6 border border-ink/10 p-6">
                <p className="font-heading text-xl">Payment verification</p>
                <p className="mt-2 text-sm text-ink/65">Paid via {order.payment_method}? Submit your reference number and we'll confirm it.</p>
                <form onSubmit={submitReference} className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <label className="flex-1">
                    <span className="sr-only">Reference number</span>
                    <input value={ref} onChange={(e) => setRef(e.target.value)} className="w-full border border-ink/20 bg-transparent p-3 text-sm focus:border-filo-red focus:outline-none" placeholder="Reference number" />
                  </label>
                  <Button type="submit">Submit</Button>
                </form>
              </div>
            )}
            {sent && <p className="mt-6 border border-ink/10 p-5 text-sm text-ink/65" role="status">Reference submitted. We'll confirm your payment shortly.</p>}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => navigate(`/track?code=${order.order_code}`)}>Track Order</Button>
              <Link to="/menu"><Button variant="secondary">Order More</Button></Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
