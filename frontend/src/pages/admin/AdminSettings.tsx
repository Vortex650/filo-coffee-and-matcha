import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";

export default function AdminSettings() {
  const [s, setS] = useState<any>(null);
  const { toast } = useToast();
  useEffect(() => { api.get("/core/settings/").then((r) => setS(r.data)).catch(() => toast("Could not load settings.", "error")); }, []);

  const save = async () => {
    try {
      const r = await api.patch("/core/settings/", s);
      setS(r.data);
      toast("Settings saved.");
    } catch {
      toast("Could not save settings.", "error");
    }
  };

  const field = "w-full border border-ink/20 bg-transparent p-3 text-sm focus:border-filo-red focus:outline-none";
  const label = "text-[10px] uppercase tracking-[0.2em] text-ink/65";

  if (!s) return (
    <div className="max-w-2xl space-y-4" aria-live="polite">
      <Skeleton className="h-10 w-48" />
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
      <span className="sr-only">Loading settings</span>
    </div>
  );

  const text = (key: string, title: string, type = "text") => (
    <div><label className={label} htmlFor={key}>{title}</label><input id={key} type={type} value={s[key] ?? ""} onChange={(e) => setS({ ...s, [key]: e.target.value })} className={`${field} mt-1`} /></div>
  );
  const toggle = (key: string, title: string) => (
    <label key={key} className="flex items-center gap-3 border border-ink/10 px-4 py-3 text-sm">
      <input type="checkbox" checked={!!s[key]} onChange={(e) => setS({ ...s, [key]: e.target.checked })} /> {title}
    </label>
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-4xl">Settings</h1>
        <button onClick={save} className="bg-filo-red px-4 py-2 text-xs uppercase tracking-[0.15em] text-filo-cream">Save</button>
      </div>

      <section className="mt-8 space-y-4">
        <h2 className="font-heading text-2xl">Business</h2>
        {text("business_name", "Business name")}
        {text("tagline", "Tagline")}
        {text("address", "Address")}
        <div className="grid grid-cols-2 gap-4">{text("contact_number", "Contact number")}{text("email", "Email", "email")}</div>
        {text("matcha_green", "Matcha green (hex)")}
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-heading text-2xl">Features</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {toggle("delivery_enabled", "Delivery enabled")}
          {toggle("reservation_enabled", "Reservations enabled")}
          {toggle("loyalty_enabled", "Loyalty enabled")}
          {toggle("senior_pwd_discount_enabled", "Senior / PWD discount")}
          {toggle("sms_notifications_enabled", "SMS notifications")}
          {toggle("advanced_loyalty_campaigns_enabled", "Advanced loyalty campaigns")}
          {toggle("inventory_enabled", "Inventory deductions")}
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-heading text-2xl">Fees & Pickup</h2>
        <div className="grid grid-cols-2 gap-4">
          {text("tax_percent", "Tax (%)", "number")}
          {text("service_fee_percent", "Service fee (%)", "number")}
          {text("pickup_slot_minutes", "Pickup slot (minutes)", "number")}
        </div>
        <p className="text-xs text-ink/65">Fees are calculated server-side on every order. Set to 0 to disable.</p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-heading text-2xl">Loyalty & Discounts</h2>
        <div className="grid grid-cols-2 gap-4">
          {text("loyalty_price_cap", "Loyalty price cap", "number")}
          {text("loyalty_expiry_days", "Loyalty expiry (days)", "number")}
          {text("senior_pwd_percent", "Senior / PWD percent", "number")}
        </div>
      </section>
    </div>
  );
}
