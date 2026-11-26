import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";

export default function AdminReservations() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/reservations/reservations/")
      .then((r) => setItems(r.data.results ?? r.data))
      .catch(() => toast("Could not load reservations.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const act = async (id: number, action: "approve" | "reject") => {
    try {
      await api.post(`/reservations/reservations/${id}/${action}/`);
      toast(action === "approve" ? "Reservation confirmed." : "Reservation declined.");
      load();
    } catch {
      toast("Could not update the reservation.", "error");
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-4xl">Reservations</h1>
        <button onClick={load} className="text-xs uppercase tracking-[0.15em] text-ink/65 hover:text-filo-red">Refresh</button>
      </div>

      <div className="mt-8 space-y-3">
        {loading && (
          <div className="space-y-3" aria-live="polite">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
            <span className="sr-only">Loading reservations</span>
          </div>
        )}
        {!loading && items.map((r) => (
          <article key={r.id} className="border border-ink/10 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-medium">{r.customer_name}</span>
              <span>{r.date} {String(r.time).slice(0, 5)}</span>
              <span className="capitalize text-ink/65">{String(r.table_type).replace("_", " ")}</span>
              <span className={`text-xs uppercase tracking-[0.14em] ${r.status === "pending" ? "text-burgundy-800" : "text-ink/65"}`}>{r.status}</span>
            </div>
            {(r.customer_mobile || r.notes) && (
              <p className="mt-2 text-xs text-ink/65">
                {r.customer_mobile}
                {r.customer_mobile && r.notes ? " · " : ""}
                {r.notes}
              </p>
            )}
            {r.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => act(r.id, "approve")} className="bg-filo-red px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-filo-cream">Confirm</button>
                <button onClick={() => act(r.id, "reject")} className="border border-ink/20 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-ink/65">Decline</button>
              </div>
            )}
          </article>
        ))}
        {!loading && items.length === 0 && (
          <EmptyState title="No reservations yet." copy="New table requests will appear here for confirmation." />
        )}
      </div>
    </div>
  );
}
