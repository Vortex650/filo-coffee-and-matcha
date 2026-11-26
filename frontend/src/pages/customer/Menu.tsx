import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { Container, Section } from "../../components/ui/Container";
import { StarMark } from "../../components/brand/StarMark";
import { EmptyState, Skeleton } from "../../components/ui/States";

export default function Menu() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [active, setActive] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/menu/products/").then((r) => r.data.results ?? r.data),
      api.get("/menu/categories/").then((r) => r.data.results ?? r.data),
    ]).then(([p, c]) => { setProducts(p); setCategories(c.filter((x: any) => x.is_active)); }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const byCat = active === "all" ? products : products.filter((p) => p.category === active);
    const q = search.trim().toLowerCase();
    return q ? byCat.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(q)) : byCat;
  }, [products, active, search]);

  return (
    <div className="bg-filo-cream">
      <Section className="pb-10">
        <Container>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-filo-red"><StarMark className="h-3 w-3" /> Menu</p>
          <h1 className="mt-4 font-heading text-5xl md:text-6xl">Find your favorite.</h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/65 md:text-base">Thoughtfully crafted coffee, matcha, and moments worth savoring.</p>
          <label className="mt-8 block max-w-sm">
            <span className="sr-only">Search menu</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the menu…" className="w-full border-b border-ink/25 bg-transparent py-2 text-sm placeholder:text-ink/65 focus:border-filo-red focus:outline-none" />
          </label>
        </Container>
      </Section>

      <div className="sticky top-[57px] z-30 border-y border-ink/10 bg-filo-cream/95 backdrop-blur">
        <Container className="flex gap-6 overflow-x-auto py-4 text-[11px] uppercase tracking-[0.2em]">
          <button onClick={() => setActive("all")} aria-pressed={active === "all"} className={`whitespace-nowrap transition ${active === "all" ? "text-filo-red" : "text-ink/65 hover:text-ink"}`}>All</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActive(c.id)} aria-pressed={active === c.id} className={`whitespace-nowrap transition ${active === c.id ? "text-filo-red" : "text-ink/65 hover:text-ink"}`}>{c.name}</button>
          ))}
        </Container>
      </div>

      <Section className="pt-12">
        <Container>
          {loading && (
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <Skeleton className="aspect-[3/4]" />
                  <Skeleton className="mt-5 h-4 w-2/3" />
                  <Skeleton className="mt-3 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-4/5" />
                </div>
              ))}
              <span className="sr-only">Loading menu</span>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <EmptyState title="Nothing here yet." copy={search ? "Try a different search or category." : "The menu is still being prepared."} />
          )}
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link to={`/product/${p.id}`} key={p.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-ink/5">
                  <img src={p.image_url || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=80"} alt={p.image_url ? p.name : `Placeholder: ${p.name}`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                  {!p.is_available && <span className="absolute left-3 top-3 bg-filo-cream/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ink/80">Unavailable</span>}
                  {p.is_best_seller && <span className="absolute right-3 top-3 bg-filo-red px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-filo-cream">Best seller</span>}
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-xl">{p.name}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-ink/65">{p.description}</p>
                    {p.review_count > 0 && (
                      <p className="mt-2 text-xs text-ink/65" aria-label={`${p.avg_rating} stars from ${p.review_count} reviews`}>
                        <span className="text-filo-red" aria-hidden>★</span> {p.avg_rating} · {p.review_count} review{p.review_count > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium">₱{p.base_price}</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
