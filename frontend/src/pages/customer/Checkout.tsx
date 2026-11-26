import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { Container, Section } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("cash");
  const [orderType, setOrderType] = useState("pickup");
  const [address, setAddress] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [notes, setNotes] = useState("");
  const [seniorPwd, setSeniorPwd] = useState(false);
  const [reward, setReward] = useState("none");
  const [promo, setPromo] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    api.get("/core/settings/").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const subtotal = cart.reduce((s: number, i: any) => s + (i.unit_price || 0) * (i.quantity || 1), 0);
  const taxPercent = Number(settings?.tax_percent || 0);
  const servicePercent = Number(settings?.service_fee_percent || 0);
  const taxPreview = subtotal * (taxPercent / 100);
  const servicePreview = subtotal * (servicePercent / 100);
  const totalPreview = subtotal + taxPreview + servicePreview;

  const pickupSlots = useMemo(() => {
    const gap = Number(settings?.pickup_slot_minutes || 15);
    const now = new Date();
    const start = new Date(now.getTime() + gap * 60000);
    start.setSeconds(0, 0);
    start.setMinutes(Math.ceil(start.getMinutes() / gap) * gap);
    return Array.from({ length: 8 }, (_, i) =>
      new Date(start.getTime() + i * gap * 60000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    );
  }, [settings]);

  const submit = async () => {
    if (!name.trim() || !mobile.trim()) { toast("Please enter your name and mobile number.", "error"); setStep(2); return; }
    if (cart.length === 0) { toast("Your cart is empty.", "error"); return; }
    setLoading(true);
    try {
      const payload = {
        customer_name: name, customer_mobile: mobile, customer_email: email,
        payment_method: method, order_type: orderType, delivery_address: address, pickup_time: pickupTime, notes,
        senior_pwd_applied: seniorPwd, reward_redemption_type: reward, promo_code: promo,
        items: cart.map((i: any) => ({ product_id: i.product_id, size_id: i.size_id, quantity: i.quantity, hot_iced: i.hot_iced, milk: i.milk || "", sugar: i.sugar || "", addons: i.addons || [], notes: i.notes || "" })),
      };
      const r = await api.post("/orders/", payload);
      localStorage.removeItem("cart");
      toast("Order received. We will keep you posted.");
      navigate(`/order/${r.data.order_code}`);
    } catch {
      toast("Something went wrong. Please try again.", "error");
    } finally { setLoading(false); }
  };

  const field = "w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-filo-red";
  const label = "text-[11px] uppercase tracking-[0.2em] text-ink/65";

  const steps = ["Order", "Details", "Payment"];

  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <h1 className="font-heading text-5xl">Checkout</h1>
          <div className="mt-6 flex gap-6 text-[11px] uppercase tracking-[0.2em]">
            {steps.map((s, i) => (
              <span key={s} className={step === i + 1 ? "text-filo-red" : step > i + 1 ? "text-ink/65" : "text-ink/65"}>{i + 1}. {s}</span>
            ))}
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              {step === 1 && (
                <div className="space-y-4">
                  {cart.map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between border-b border-ink/10 pb-4 text-sm">
                      <span>{i.product_name} × {i.quantity}</span>
                      <span>₱{((i.unit_price || 0) * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2"><Button onClick={() => setStep(2)}>Continue to Details</Button></div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 max-w-lg">
                  <div><label className={label} htmlFor="name">Name</label><input id="name" value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-2`} /></div>
                  <div><label className={label} htmlFor="mobile">Mobile</label><input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className={`${field} mt-2`} /></div>
                  <div><label className={label} htmlFor="email">Email (optional)</label><input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mt-2`} /></div>
                  <div><label className={label} htmlFor="type">Order type</label>
                    <select id="type" value={orderType} onChange={(e) => setOrderType(e.target.value)} className={`${field} mt-2`}>
                      <option value="pickup">Pickup</option>
                      <option value="delivery">Delivery</option>
                      <option value="dine_in">Dine In</option>
                    </select>
                  </div>
                  {orderType === "delivery" && <div><label className={label} htmlFor="address">Delivery address</label><textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className={`${field} mt-2`} /></div>}
                  {orderType === "pickup" && (
                    <div>
                      <label className={label} htmlFor="pickup">Pickup time</label>
                      <select id="pickup" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={`${field} mt-2`}>
                        <option value="">As soon as possible</option>
                        {pickupSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <p className="mt-2 text-xs text-ink/65">We'll have your order ready for this window.</p>
                    </div>
                  )}
                  <div><label className={label} htmlFor="notes">Order notes</label><textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={`${field} mt-2`} /></div>
                  <div className="flex gap-3"><Button variant="secondary" onClick={() => setStep(1)}>Back</Button><Button onClick={() => setStep(3)}>Continue to Payment</Button></div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 max-w-lg">
                  <div><label className={label} htmlFor="method">Payment method</label>
                    <select id="method" value={method} onChange={(e) => setMethod(e.target.value)} className={`${field} mt-2`}>
                      <option value="cash">Cash</option>
                      <option value="gcash">GCash</option>
                      <option value="maya">Maya</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={seniorPwd} onChange={(e) => setSeniorPwd(e.target.checked)} /> Senior / PWD discount</label>
                  <div><label className={label} htmlFor="reward">Reward</label>
                    <select id="reward" value={reward} onChange={(e) => setReward(e.target.value)} className={`${field} mt-2`}>
                      <option value="none">No reward redemption</option>
                      <option value="half_off">Use 5 stars (50% off)</option>
                      <option value="free_drink">Use 10 stars (free drink)</option>
                    </select>
                  </div>
                  <div><label className={label} htmlFor="promo">Promo code</label><input id="promo" value={promo} onChange={(e) => setPromo(e.target.value)} className={`${field} mt-2`} /></div>
                  <div className="flex gap-3"><Button variant="secondary" onClick={() => setStep(2)}>Back</Button><Button onClick={submit} disabled={loading}>{loading ? "Placing…" : "Place Order"}</Button></div>
                </div>
              )}
            </div>

            <div className="h-fit border border-ink/10 p-6 lg:sticky lg:top-28">
              <h2 className="font-heading text-2xl">Order Summary</h2>
              <div className="mt-5 space-y-3 text-sm text-ink/70">
                <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Discounts</span><span className="text-ink/65">Applied on order</span></div>
                {taxPercent > 0 && <div className="flex justify-between"><span>Tax ({taxPercent}%)</span><span>₱{taxPreview.toFixed(2)}</span></div>}
                {servicePercent > 0 && <div className="flex justify-between"><span>Service fee ({servicePercent}%)</span><span>₱{servicePreview.toFixed(2)}</span></div>}
                {pickupTime && <div className="flex justify-between"><span>Pickup</span><span>{pickupTime}</span></div>}
              </div>
              <div className="mt-5 flex justify-between border-t border-ink/10 pt-5 font-heading text-xl"><span>Estimated total</span><span>₱{totalPreview.toFixed(2)}</span></div>
              <p className="mt-2 text-xs text-ink/65">Final total is confirmed by the café after discounts are applied.</p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
