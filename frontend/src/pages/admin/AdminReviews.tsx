import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    return api.get("/reviews/")
      .then((r) => { setReviews(r.data.results ?? r.data); setError(""); })
      .catch(() => setError("Could not load reviews."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => filter === "all" ? reviews : reviews.filter((r) => (filter === "published" ? r.is_published : !r.is_published)), [reviews, filter]);
  const average = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  const toggle = async (r: any) => {
    try {
      await api.patch(`/reviews/${r.id}/`, { is_published: !r.is_published });
      toast(r.is_published ? "Review hidden." : "Review published.");
      load();
    } catch {
      toast("Could not update the review.", "error");
    }
  };
  const remove = async (r: any) => {
    if (!confirm(`Delete the review by ${r.user_name}?`)) return;
    try {
      await api.delete(`/reviews/${r.id}/`);
      toast("Review deleted.");
      load();
    } catch {
      toast("Could not delete the review.", "error");
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-4xl">Reviews</h1>
        <div className="flex gap-2">
          {[["all", "All"], ["published", "Published"], ["hidden", "Hidden"]].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition ${filter === key ? "bg-filo-red text-filo-cream" : "border border-ink/15 text-ink/65 hover:border-ink/40"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-ink/65">{reviews.length} review{reviews.length === 1 ? "" : "s"} · average {average} / 5</p>
      {error && <p className="mt-4 text-sm text-filo-red" role="alert">{error}</p>}

      <div className="mt-8 space-y-3">
        {loading && (
          <div className="space-y-3" aria-live="polite">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}
            <span className="sr-only">Loading reviews</span>
          </div>
        )}
        {!loading && visible.map((r) => (
          <article key={r.id} className="border border-ink/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{r.user_name} <span className="font-normal text-ink/65">on {r.product_name}</span></p>
                <p className="mt-1 text-filo-red" aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}<span className="text-ink/65">{"★".repeat(5 - r.rating)}</span></p>
              </div>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em]">
                <span className={r.is_published ? "text-ink/65" : "text-filo-red"}>{r.is_published ? "Published" : "Hidden"}</span>
                {r.is_verified && <span className="text-matcha">Verified</span>}
              </div>
            </div>
            {r.comment && <p className="mt-3 text-sm leading-relaxed text-ink/70">{r.comment}</p>}
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-ink/65">
              <span>{new Date(r.created_at).toLocaleDateString([], { dateStyle: "medium" })}</span>
              <div className="flex gap-4">
                <button onClick={() => toggle(r)} className="uppercase tracking-[0.12em] text-ink/65 hover:text-filo-red">{r.is_published ? "Hide" : "Publish"}</button>
                <button onClick={() => remove(r)} className="uppercase tracking-[0.12em] text-ink/65 hover:text-filo-red">Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!loading && visible.length === 0 && (
          <EmptyState title="No reviews in this view." copy="Reviews from verified orders will appear here." />
        )}
      </div>
    </div>
  );
}
