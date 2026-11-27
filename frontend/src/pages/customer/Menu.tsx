import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiSearch, FiSliders, FiX } from "react-icons/fi";
import { Reveal } from "../../components/ui/Reveal";
import { Skeleton } from "../../components/ui/States";
import { CircleMotif } from "../../components/brand/CircleMotif";
import ProductCard from "../../components/menu/ProductCard";
import {
  FilterSheet,
  InlineFilters,
  SortSelect,
} from "../../components/menu/MenuFilters";
import { activeFilterCount, applyFilters, fetchMenu } from "../../services/menu";
import { images } from "../../content/site";
import type { MenuCategory, MenuFilters, MenuProduct, SortKey } from "../../types/menu";

const SORTS: SortKey[] = ["recommended", "popular", "price-asc", "price-desc", "newest"];
const PRICES: MenuFilters["price"][] = ["all", "under-120", "120-150", "over-150"];

function parseParams(params: URLSearchParams): { filters: MenuFilters; search: string } {
  const category = Number(params.get("category"));
  const sort = params.get("sort") as SortKey;
  const price = params.get("price") as MenuFilters["price"];
  return {
    search: params.get("q") ?? "",
    filters: {
      category: Number.isFinite(category) && category > 0 ? category : "all",
      tags: (params.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      sort: SORTS.includes(sort) ? sort : "recommended",
      price: PRICES.includes(price) ? price : "all",
      onlyAvailable: params.get("available") === "1",
    },
  };
}

function paramsFor(filters: MenuFilters, search: string) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("q", search);
  if (filters.category !== "all") params.set("category", String(filters.category));
  if (filters.tags.length) params.set("tags", filters.tags.join(","));
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  if (filters.price !== "all") params.set("price", filters.price);
  if (filters.onlyAvailable) params.set("available", "1");
  return params;
}

export default function Menu() {
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, search } = useMemo(() => parseParams(searchParams), [searchParams]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);

  const setFilters = (next: MenuFilters) =>
    setSearchParams(paramsFor(next, search), { replace: true });
  const setSearch = (next: string) =>
    setSearchParams(paramsFor(filters, next), { replace: true });

  const load = () => {
    setLoading(true);
    setError("");
    fetchMenu()
      .then(({ products: nextProducts, categories: nextCategories }) => {
        setProducts(nextProducts);
        setCategories(nextCategories);
      })
      .catch(() => setError("We could not load the menu just now."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => applyFilters(products, filters, search), [products, filters, search]);

  const featured = useMemo(() => {
    const picks = products.filter(
      (p) => p.availability_status !== "hidden" && (p.is_signature || p.is_best_seller)
    );
    return picks.slice(0, 4);
  }, [products]);

  const seasonal = useMemo(
    () => products.filter((p) => p.is_seasonal && p.availability_status !== "hidden").slice(0, 3),
    [products]
  );

  const activeCategory = categories.find((c) => c.id === filters.category);
  const searchActive = search.trim().length > 0;
  const filterCount = activeFilterCount(filters);
  const hasPlaceholders = products.some((p) => p.is_placeholder);

  const setCategory = (category: number | "all") => {
    setFilters({ ...filters, category });
  };

  const clearAll = () => {
    setSearchParams({}, { replace: true });
  };

  const countFor = (next: MenuFilters) => applyFilters(products, next, search).length;

  const categoryCount = (id: number | "all") =>
    id === "all"
      ? products.length
      : products.filter((p) => p.category === id).length;

  const scrollToCollection = () => {
    collectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-cream">
      {/* Editorial introduction */}
      <section className="relative overflow-hidden bg-burgundy-900 text-cream">
        <div className="pointer-events-none absolute -right-40 top-1/2 hidden -translate-y-1/2 text-cream lg:block" aria-hidden>
          <CircleMotif className="h-[42rem] w-[42rem]" rings={5} dashed />
        </div>
        <div className="relative mx-auto grid w-full max-w-[1440px] gap-10 px-5 pb-14 pt-28 md:px-10 md:pb-20 md:pt-32 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6 lg:self-center">
            <Reveal>
              <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-cream/65">
                <span className="h-px w-8 bg-cream/30" aria-hidden />
                The Menu
              </p>
              <h1 className="mt-6 font-heading text-[clamp(3rem,7vw,5.4rem)] leading-[0.98]">
                Find your{" "}
                <br />
                <span className="italic text-ivory">favorite.</span>
              </h1>
              <p className="mt-6 max-w-md text-[15px] leading-[1.9] text-cream/65">
                Discover thoughtfully crafted coffee and matcha, made for moments worth
                slowing down.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-9">
                <label htmlFor="menu-search" className="text-[9px] uppercase tracking-[0.28em] text-cream/70">
                  Search the menu
                </label>
                <div className="relative mt-2 flex items-center border-b border-cream/25 focus-within:border-cream">
                  <FiSearch size={16} className="shrink-0 text-cream/70" aria-hidden />
                  <input
                    ref={searchRef}
                    id="menu-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="A drink, a flavor, a feeling…"
                    className="w-full bg-transparent px-3 py-3 text-sm text-cream placeholder:text-cream/65 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                  />
                  {searchActive ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="p-2 text-cream/60 transition hover:text-cream"
                    >
                      <FiX size={16} />
                    </button>
                  ) : (
                    <kbd className="hidden border border-cream/20 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-cream/65 sm:block">
                      /
                    </kbd>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[9px] uppercase tracking-[0.24em] text-cream/70">
                <button
                  type="button"
                  onClick={scrollToCollection}
                  className="inline-flex items-center gap-2 border-b border-cream/30 pb-1 text-cream/80 transition hover:border-cream hover:text-cream"
                >
                  Browse the collection
                  <span aria-hidden>↓</span>
                </button>
                <span>{categories.length} collections</span>
                <span>{products.length} drinks &amp; bites</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.18} className="lg:col-span-5 lg:col-start-8">
            <figure className="relative">
              <div className="relative aspect-[4/5] overflow-hidden bg-ivory/10">
                <img
                  src={images.momentMatcha.src}
                  alt={images.momentMatcha.alt}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-burgundy-950/10" aria-hidden />
              </div>
              <figcaption className="absolute -bottom-5 left-4 right-4 border border-cream/15 bg-burgundy-950/90 px-5 py-4 backdrop-blur-sm sm:left-6 sm:right-auto sm:max-w-xs">
                <p className="text-[9px] uppercase tracking-[0.28em] text-cream/70">
                  {hasPlaceholders ? "Sample menu" : "Crafted simply"}
                </p>
                <p className="mt-1.5 font-heading text-lg italic leading-snug text-cream/85">
                  {hasPlaceholders
                    ? "Official drinks and pricing will be confirmed at launch."
                    : "Crafted simply. Served warmly."}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Category navigation */}
      <div className="sticky top-[71px] z-40 border-b border-ink/10 bg-cream/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4 px-5 md:px-10">
          <nav
            aria-label="Menu collections"
            className="flex flex-1 gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <CategoryButton
              active={filters.category === "all"}
              label="All"
              count={categoryCount("all")}
              onClick={() => setCategory("all")}
            />
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                active={filters.category === category.id}
                label={category.name}
                count={categoryCount(category.id)}
                onClick={() => setCategory(category.id)}
              />
            ))}
          </nav>
          <button
            ref={filterBtnRef}
            type="button"
            onClick={() => setSheetOpen(true)}
            className="relative inline-flex min-h-[40px] shrink-0 items-center gap-2 border border-ink/20 px-3 text-[10px] uppercase tracking-[0.18em] text-ink/70 md:hidden"
          >
            <FiSliders size={13} aria-hidden />
            Filter
            {filterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy-800 text-[9px] text-cream">
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingMenu />
      ) : error ? (
        <ErrorMenu message={error} onRetry={load} />
      ) : (
        <>
          {featured.length > 0 && !searchActive && filters.category === "all" && filters.tags.length === 0 && (
            <section className="border-b border-ink/10 bg-ivory/40 py-16 md:py-24">
              <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-burgundy-800">
                      House favorites
                    </p>
                    <h2 className="mt-4 font-heading text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.04]">
                      The ones we reach for.
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-relaxed text-ink/70">
                    Signature pours and quiet classics, chosen by the people who make them.
                  </p>
                </div>

                <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-8">
                  <div className="md:col-span-7">
                    <ProductCard product={featured[0]} variant="feature" />
                  </div>
                  <div className="md:col-span-4 md:col-start-9">
                    <p className="border-b border-ink/15 pb-3 text-[9px] uppercase tracking-[0.26em] text-ink/70">
                      Also worth trying
                    </p>
                    <div className="mt-2">
                      {featured.slice(1, 4).map((product) => (
                        <ProductCard key={product.id} product={product} variant="compact" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section id="collection" ref={collectionRef} className="scroll-mt-32 py-14 md:py-20">
            <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
              <div className="flex flex-col gap-6 border-b border-ink/10 pb-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-burgundy-800">
                      {activeCategory ? activeCategory.name : "The full collection"}
                    </p>
                    <h2 className="mt-3 font-heading text-[clamp(2rem,3.4vw,2.9rem)] leading-tight">
                      {searchActive
                        ? `Results for “${search.trim()}”`
                        : activeCategory
                          ? activeCategory.description ||
                            `The ${activeCategory.name.toLowerCase()} collection.`
                          : "Every drink, in one place."}
                    </h2>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/65" aria-live="polite">
                      {filtered.length} {filtered.length === 1 ? "drink" : "drinks"}
                      {filterCount > 0 ? ` · ${filterCount} filter${filterCount === 1 ? "" : "s"}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <SortSelect value={filters.sort} onChange={(sort: SortKey) => setFilters({ ...filters, sort })} />
                  </div>
                </div>

                <div className="hidden md:block">
                  <InlineFilters filters={filters} onChange={setFilters} />
                </div>

                {(searchActive || filterCount > 0) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-ink/70">
                    <span className="text-[10px] uppercase tracking-[0.2em]">Active</span>
                    {searchActive && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="inline-flex items-center gap-1.5 border border-ink/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]"
                      >
                        “{search.trim()}” <FiX size={11} aria-hidden />
                      </button>
                    )}
                    {filters.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setFilters({ ...filters, tags: filters.tags.filter((t) => t !== tag) })
                        }
                        className="inline-flex items-center gap-1.5 border border-ink/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]"
                      >
                        {tag.replace("-", " ")} <FiX size={11} aria-hidden />
                      </button>
                    ))}
                    {filters.price !== "all" && (
                      <button
                        type="button"
                        onClick={() => setFilters({ ...filters, price: "all" })}
                        className="inline-flex items-center gap-1.5 border border-ink/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]"
                      >
                        {filters.price.replace("-", " – ")} <FiX size={11} aria-hidden />
                      </button>
                    )}
                    {filters.onlyAvailable && (
                      <button
                        type="button"
                        onClick={() => setFilters({ ...filters, onlyAvailable: false })}
                        className="inline-flex items-center gap-1.5 border border-ink/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]"
                      >
                        Available now <FiX size={11} aria-hidden />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-[10px] uppercase tracking-[0.18em] text-burgundy-800 underline underline-offset-4"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {filtered.length === 0 ? (
                <EmptyMenu search={search} onClear={clearAll} />
              ) : (
                <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {seasonal.length > 0 && !searchActive && filterCount === 0 && (
            <section className="border-t border-ink/10 bg-burgundy-900 py-16 text-cream md:py-24">
              <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
                <div className="grid gap-10 md:grid-cols-12 md:gap-8">
                  <div className="md:col-span-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-cream/70">
                      In season
                    </p>
                    <h2 className="mt-4 font-heading text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.04]">
                      A little
                      <br />
                      <span className="italic text-ivory">for now.</span>
                    </h2>
                    <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">
                      Limited pours that follow the season. When they are gone, they are gone.
                    </p>
                  </div>
                  <div className="grid gap-6 md:col-span-7 md:col-start-6 sm:grid-cols-2">
                    {seasonal.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="group border border-cream/15 p-5 transition hover:border-cream/40"
                      >
                        <p className="text-[9px] uppercase tracking-[0.24em] text-cream/70">
                          {product.category_name}
                        </p>
                        <h3 className="mt-2 font-heading text-2xl leading-tight">{product.name}</h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-cream/60">
                          {product.description}
                        </p>
                        <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-cream/70">
                          View drink <span aria-hidden>→</span>
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {filtered.length > 0 && !searchActive && filterCount === 0 && (
            <section className="border-t border-ink/10 py-16 md:py-20">
              <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
                <div className="grid gap-8 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-burgundy-800">
                      Explore further
                    </p>
                    <h2 className="mt-4 font-heading text-3xl leading-tight">
                      More to discover.
                    </h2>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/70">
                      Not sure where to start? These are the drinks our guests keep coming back to.
                    </p>
                  </div>
                  <div className="md:col-span-7 md:col-start-6">
                    {applyFilters(products, { ...filters, sort: "popular" }, "")
                      .slice(0, 4)
                      .map((product) => (
                        <ProductCard key={product.id} product={product} variant="compact" />
                      ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={setFilters}
        countFor={countFor}
        returnFocusTo={filterBtnRef}
      />
    </div>
  );
}

function CategoryButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative whitespace-nowrap px-4 py-4 text-[10px] uppercase tracking-[0.18em] transition ${
        active ? "text-burgundy-800" : "text-ink/70 hover:text-ink"
      }`}
    >
      {label}
      <span className="ml-1.5 text-[8px] text-ink/65">{count}</span>
      <span
        aria-hidden
        className={`absolute inset-x-4 bottom-0 h-px origin-left bg-burgundy-800 transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </button>
  );
}

function LoadingMenu() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-24" aria-live="polite">
      <span className="sr-only">Loading the menu</span>
      <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index}>
            <Skeleton className="aspect-[4/5]" />
            <Skeleton className="mt-5 h-3 w-1/4" />
            <Skeleton className="mt-3 h-5 w-2/3" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorMenu({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-24 text-center md:px-10">
      <CircleMotif className="mx-auto h-20 w-20 text-burgundy-800/30" rings={3} />
      <p className="mt-8 font-heading text-3xl">The menu is taking a moment.</p>
      <p className="mt-3 text-sm leading-relaxed text-ink/65">
        {message} Please try again, or follow along for our opening.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-8 min-h-[48px] border border-burgundy-800 px-7 text-[10px] uppercase tracking-[0.22em] text-burgundy-800 transition hover:bg-burgundy-800 hover:text-cream"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyMenu({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="mt-10 border border-ink/10 px-6 py-20 text-center">
      <CircleMotif className="mx-auto h-16 w-16 text-burgundy-800/30" rings={3} />
      <p className="mt-6 font-heading text-3xl">
        {search.trim() ? "No drinks found." : "No drinks in this collection yet."}
      </p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/70">
        {search.trim()
          ? "Try another search, or explore the full collection."
          : "We are still preparing this part of the menu. Try another collection in the meantime."}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-7 min-h-[44px] border border-ink/20 px-6 text-[10px] uppercase tracking-[0.22em] text-ink/70 transition hover:border-ink/50"
      >
        Clear filters
      </button>
    </div>
  );
}
