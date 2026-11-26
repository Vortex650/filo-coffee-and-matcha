import { useState } from "react";
import { api } from "../../services/api";
import { Container, Section } from "../../components/ui/Container";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

const initial = {
  customer_name: "",
  customer_mobile: "",
  date: "",
  time: "",
  party_size: 2,
  table_type: "small",
  area_preference: "",
  notes: "",
};

export default function Reservations() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.customer_name.trim() || !form.customer_mobile.trim() || !form.date || !form.time) {
      toast("Add your name, mobile number, date, and time so we can confirm.", "error");
      return;
    }
    setLoading(true);
    try {
      await api.post("/reservations/reservations/", form);
      setSent(true);
      setForm(initial);
      toast("Reservation request received. We will confirm shortly.");
    } catch {
      toast("Could not submit the reservation. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full border border-ink/25 bg-transparent p-3 text-sm focus:border-burgundy-800 focus:outline-none";
  const label = "text-[10px] uppercase tracking-[0.2em] text-ink/65";

  return (
    <div className="bg-cream">
      <Section>
        <Container>
          <SectionHeading
            level={1}
            eyebrow="Reservations"
            title="Reserve a table."
            copy="Tell us when you would like to visit. We will confirm by mobile once the table is arranged. Confirmed opening hours are still to be announced."
          />

          {sent ? (
            <div className="mt-10 max-w-xl border border-ink/10 bg-ivory/50 p-8" role="status">
              <p className="font-heading text-3xl">Request received.</p>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                We have your reservation request and will be in touch to confirm. For changes, contact us on Instagram.
              </p>
              <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
                Request another table
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-10 grid max-w-xl gap-5">
              <div>
                <label className={label} htmlFor="res-name">Name</label>
                <input id="res-name" autoComplete="name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={`${input} mt-2`} required />
              </div>
              <div>
                <label className={label} htmlFor="res-mobile">Mobile</label>
                <input id="res-mobile" type="tel" autoComplete="tel" value={form.customer_mobile} onChange={(e) => setForm({ ...form, customer_mobile: e.target.value })} className={`${input} mt-2`} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="res-date">Date</label>
                  <input id="res-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={`${input} mt-2`} required />
                </div>
                <div>
                  <label className={label} htmlFor="res-time">Time</label>
                  <input id="res-time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={`${input} mt-2`} required />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="res-party">Party size</label>
                <input id="res-party" type="number" min={1} value={form.party_size} onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })} className={`${input} mt-2`} />
              </div>
              <div>
                <label className={label} htmlFor="res-table">Table type</label>
                <select id="res-table" value={form.table_type} onChange={(e) => setForm({ ...form, table_type: e.target.value })} className={`${input} mt-2`}>
                  <option value="small">Small table (2 seats)</option>
                  <option value="large">Large table (4–6 seats)</option>
                  <option value="arrangement">Request an arrangement</option>
                </select>
              </div>
              <div>
                <label className={label} htmlFor="res-area">Area preference</label>
                <select id="res-area" value={form.area_preference} onChange={(e) => setForm({ ...form, area_preference: e.target.value })} className={`${input} mt-2`}>
                  <option value="">No preference</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
              <div>
                <label className={label} htmlFor="res-notes">Notes</label>
                <textarea id="res-notes" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${input} mt-2`} placeholder="Optional — accessibility needs, occasion, or seating notes" />
              </div>
              <div>
                <Button type="submit" disabled={loading}>{loading ? "Sending…" : "Submit Reservation"}</Button>
              </div>
              <p className="text-xs leading-relaxed text-ink/65">
                Requests are not confirmed until the café replies. Opening hours and full address are still to be confirmed.
              </p>
            </form>
          )}
        </Container>
      </Section>
    </div>
  );
}
