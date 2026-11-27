import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiMinus, FiPlus } from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/States";
import { CircleMotif } from "../../components/brand/CircleMotif";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import { business, ORDERING_ENABLED } from "../../content/site";
import { api } from "../../services/api";
import CustomizationGroupControl from "../../components/menu/CustomizationGroupControl";
import ProductCard, { ProductBadges } from "../../components/menu/ProductCard";
import {
  availabilityCopy,
  computePrice,
  defaultSelections,
  fetchPricePreview,
  fetchProduct,
  fetchRelated,
  formatPeso,
  priceRequest,
  productImage,
  selectionPayload,
  validateSelections,
} from "../../services/menu";
import type { MenuProduct, PricePreview } from "../../types/menu";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<MenuProduct | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [related, setRelated] = useState<MenuProduct[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [favId, setFavId] = useState<number | null>(null);

  const loadReviews = () =>
    api
      .get(`/reviews/?product=${id}`)
      .then((response) => setReviews(response.data.results ?? response.data))
      .catch(() => {});

  useEffect(() => {
    let active = true;
    setProduct(null);
    setLoadError("");
    setSelections({});
    setQty(1);
    setNotes("");
    setError("");
    fetchProduct(id as string)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setSelections(defaultSelections(data));
      })
      .catch(() => active && setLoadError("We could not find this drink."));
    loadReviews();
    fetchRelated(id as string)
      .then((data) => active && setRelated(data))
      .catch(() => active && setRelated([]));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/menu/favorites/")
      .then((response) => {
        const list = response.data.results ?? response.data;
        const found = list.find((f: any) => String(f.product) === String(id));
        if (found) {
          setFavorite(true);
          setFavId(found.id);
        }
      })
      .catch(() => {});
  }, [user, id]);

  const price = useMemo(() => {
    if (!product) return { unit: 0, lines: [] as { label: string; amount: string }[] };
    return computePrice(product, selections);
  }, [product, selections]);

  // Ask the backend for an authoritative quote. The local calculation keeps the
  // UI instant; the server response corrects any rule the frontend cannot know.
  const [quote, setQuote] = useState<PricePreview | null>(null);
  useEffect(() => {
    if (!product) {
      setQuote(null);
      return;
    }
    setQuote(null);
    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetchPricePreview(String(product.id), priceRequest(product, selections, qty))
        .then((data) => {
          if (!cancelled) setQuote(data as PricePreview);
        })
        .catch(() => {
          if (!cancelled) setQuote(null);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [product, selections, qty]);

  const displayUnit = quote ? Number(quote.unit_price) : price.unit;
  const displayLines = quote?.breakdown?.length ? quote.breakdown : price.lines;

  const availability = product ? availabilityCopy(product) : { title: "", copy: "", orderable: false };

  const toggleFavorite = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      if (favorite && favId) {
        await api.delete(`/menu/favorites/${favId}/`);
        setFavorite(false);
        setFavId(null);
      } else {
        const response = await api.post("/menu/favorites/", { product: Number(id) });
        setFavorite(true);
        setFavId(response.data.id);
      }
    } catch {
      toast("Could not update your favorites.", "error");
    }
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating) {
      toast("Please choose a rating.", "error");
      return;
    }
    try {
      await api.post("/reviews/", { product: Number(id), rating, comment });
      setRating(0);
      setComment("");
      toast("Thank you — your review has been posted.");
      loadReviews();
      fetchProduct(id as string).then(setProduct).catch(() => {});
    } catch (err: any) {
      toast(
        err?.response?.data?.detail ||
          "Could not post your review. You may have already reviewed this item.",
        "error"
      );
    }
  };

  const addToSelection = () => {
    if (!product) return;
    const message = validateSelections(product, selections);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    const payload = selectionPayload(product, selections);
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
      product_id: product.id,
      product_name: product.name,
      image_url: product.image_url || "",
      ...payload,
      quantity: qty,
      notes,
      unit_price: displayUnit,
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    toast(`${product.name} added to your cart.`);
    navigate("/cart");
  };

  if (loadError) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-5 pt-24 text-center">
        <CircleMotif className="h-20 w-20 text-burgundy-800/30" rings={3} />
        <p className="mt-8 font-heading text-3xl">{loadError}</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/70">
          It may have been removed, or the link may be mistyped.
        </p>
        <Link
          to="/menu"
          className="mt-8 inline-flex min-h-[48px] items-center border border-burgundy-800 px-7 text-[10px] uppercase tracking-[0.22em] text-burgundy-800 transition hover:bg-burgundy-800 hover:text-cream"
        >
          Back to the menu
        </Link>
      </div>
    );
  }

  if (!product) return <ProductSkeleton />;

  const image = productImage(product);
  const isDrink = product.customization_groups.length > 0;

  return (
    <div className="bg-cream">
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-24 md:px-10 md:pt-28">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-ink/65">
          <Link to="/menu" className="inline-flex items-center gap-1.5 transition hover:text-burgundy-800">
            <FiArrowLeft size={11} aria-hidden /> Menu
          </Link>
          <span aria-hidden>/</span>
          <span>{product.category_name}</span>
          <span aria-hidden>/</span>
          <span className="text-ink/70">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto w-full max-w-[1440px] px-5 pb-16 pt-8 md:px-10 md:pb-24 md:pt-10">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8 lg:gap-14">
          {/* Image */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="md:sticky md:top-28">
              <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <ProductBadges product={product} onImage />
                  </div>
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={favorite}
                    className="flex h-10 w-10 items-center justify-center border border-cream/50 bg-cream/85 text-ink/70 backdrop-blur-sm transition hover:text-burgundy-800"
                  >
                    <FiHeart size={17} fill={favorite ? "currentColor" : "none"} />
                  </button>
                </div>
                {!availability.orderable && (
                  <div className="absolute inset-0 flex items-end bg-ink/20 p-5">
                    <p className="border border-cream/40 bg-cream/95 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-ink">
                      {availability.title}
                    </p>
                  </div>
                )}
              </div>
              {image.placeholder && (
                <p className="mt-3 text-[10px] leading-relaxed text-ink/65">
                  Placeholder image — official photography will replace this at launch.
                </p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">
            <p className="text-[10px] uppercase tracking-[0.3em] text-burgundy-800">
              {product.category_name}
            </p>
            <h1 className="mt-3 font-heading text-[clamp(2.6rem,5.5vw,4.4rem)] leading-[1.02]">
              {product.name}
            </h1>

            {product.review_count > 0 && (
              <a
                href="#reviews"
                className="mt-3 inline-flex items-center gap-2 text-xs text-ink/70 transition hover:text-burgundy-800"
              >
                <Stars value={Number(product.avg_rating)} />
                {product.avg_rating} · {product.review_count} review
                {product.review_count > 1 ? "s" : ""}
              </a>
            )}

            <p className="mt-5 max-w-lg text-[15px] leading-[1.9] text-ink/65">
              {product.description}
            </p>
            {product.flavor_notes && (
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-ink/65">
                {product.flavor_notes}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-y border-ink/10 py-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.24em] text-ink/65">Your selection</p>
                <p className="mt-1 font-heading text-3xl" aria-live="polite">
                  {formatPeso(displayUnit)}
                </p>
                {qty > 1 && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-ink/60">
                    {formatPeso(displayUnit * qty)} for {qty}
                  </p>
                )}
              </div>
              {displayLines.length > 1 && (
                <details className="text-xs text-ink/70">
                  <summary className="cursor-pointer text-[10px] uppercase tracking-[0.18em] underline underline-offset-4">
                    Price details
                  </summary>
                  <dl className="mt-3 w-56 space-y-1.5">
                    {displayLines.map((line) => (
                      <div key={`${line.label}-${line.amount}`} className="flex justify-between gap-4">
                        <dt>{line.label}</dt>
                        <dd className="tabular-nums">{formatPeso(line.amount)}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
            </div>

            {!availability.orderable && (
              <div className="mt-6 border border-burgundy-800/20 bg-ivory/60 p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-burgundy-800">
                  {availability.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{availability.copy}</p>
              </div>
            )}

            {isDrink && (
              <div className="mt-8 space-y-7">
                {product.customization_groups.map((group) => (
                  <CustomizationGroupControl
                    key={group.key}
                    group={group}
                    idPrefix={`product-${product.id}`}
                    selected={selections[group.key] || []}
                    onChange={(next) => {
                      setError("");
                      setSelections((current) => ({ ...current, [group.key]: next }));
                    }}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 grid gap-5 border-t border-ink/10 pt-6 sm:grid-cols-[auto_1fr]">
              <div>
                <p className="text-[9px] uppercase tracking-[0.24em] text-ink/70">Quantity</p>
                <div className="mt-2 inline-flex items-center border border-ink/20">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Decrease quantity"
                    className="flex h-11 w-11 items-center justify-center text-ink/70 transition hover:bg-ink/5"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm tabular-nums" aria-live="polite">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(20, qty + 1))}
                    aria-label="Increase quantity"
                    className="flex h-11 w-11 items-center justify-center text-ink/70 transition hover:bg-ink/5"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="product-notes" className="text-[9px] uppercase tracking-[0.24em] text-ink/70">
                  Special instructions · optional
                </label>
                <input
                  id="product-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value.slice(0, 200))}
                  maxLength={200}
                  placeholder="Allergies, preferences, a little note…"
                  className="mt-2 w-full border border-ink/20 bg-transparent px-3 py-3 text-sm placeholder:text-ink/35 focus:border-burgundy-800 focus:outline-none"
                />
                <p className="mt-1 text-right text-[10px] text-ink/65">{notes.length}/200</p>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-5 border-l-2 border-burgundy-800 pl-3 text-sm text-burgundy-800">
                {error}
              </p>
            )}

            {ORDERING_ENABLED && availability.orderable ? (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button onClick={addToSelection} className="flex-1">
                  Add to Cart · {formatPeso(displayUnit * qty)}
                </Button>
                <Button variant="secondary" onClick={() => navigate("/cart")}>
                  View Cart
                </Button>
              </div>
            ) : (
              <div className="mt-7 border border-ink/10 bg-ivory/50 p-6">
                <p className="text-[10px] uppercase tracking-[0.26em] text-ink/70">
                  {availability.orderable ? "Opening Soon" : availability.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {availability.orderable
                    ? "Online ordering opens at launch. This drink will be available when we open our doors."
                    : availability.copy}
                </p>
                <a
                  href={business.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-[10px] uppercase tracking-[0.22em] text-burgundy-800 underline underline-offset-4"
                >
                  Follow {business.instagramHandle} for updates
                </a>
              </div>
            )}

            {(product.ingredients || product.allergens) && (
              <dl className="mt-7 grid gap-4 border-t border-ink/10 pt-6 text-sm sm:grid-cols-2">
                {product.ingredients && (
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.24em] text-ink/65">Ingredients</dt>
                    <dd className="mt-1.5 leading-relaxed text-ink/65">{product.ingredients}</dd>
                  </div>
                )}
                {product.allergens && (
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.24em] text-ink/65">Allergens</dt>
                    <dd className="mt-1.5 leading-relaxed text-ink/65">{product.allergens}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>

        {product.story && (
          <div className="mt-16 grid gap-6 border-t border-ink/10 pt-12 md:mt-24 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-burgundy-800">The drink</p>
            </div>
            <p className="max-w-2xl font-heading text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.35] text-ink/80 md:col-span-8">
              {product.story}
            </p>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink/10 bg-ivory/40 py-16 md:py-20">
          <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-burgundy-800">
                  You may also like
                </p>
                <h2 className="mt-3 font-heading text-[clamp(1.9rem,3vw,2.6rem)] leading-tight">
                  Keep exploring.
                </h2>
              </div>
              <Link
                to="/menu"
                className="text-[10px] uppercase tracking-[0.22em] text-ink/70 underline underline-offset-4 transition hover:text-burgundy-800"
              >
                View the full menu
              </Link>
            </div>
            <div className="mt-8 grid gap-x-8 gap-y-2 md:grid-cols-2">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="reviews" className="scroll-mt-28 border-t border-ink/10 py-16 md:py-24">
        <div className="mx-auto grid w-full max-w-[1440px] gap-14 px-5 md:grid-cols-12 md:gap-10 md:px-10">
          <div className="md:col-span-7">
            <p className="text-[10px] uppercase tracking-[0.3em] text-burgundy-800">Reviews</p>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <h2 className="font-heading text-[clamp(2rem,3.4vw,2.9rem)] leading-tight">
                What people are saying.
              </h2>
              {product.review_count > 0 && (
                <span className="mb-1 flex items-center gap-2 text-sm text-ink/70">
                  <Stars value={Number(product.avg_rating)} size={16} /> {product.avg_rating} ·{" "}
                  {product.review_count} review{product.review_count > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="mt-8 space-y-6">
              {reviews.map((review) => (
                <article key={review.id} className="border-b border-ink/10 pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{review.user_name}</span>
                      {review.is_verified && (
                        <span className="border border-matcha/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-matcha">
                          Verified order
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink/70">
                      {new Date(review.created_at).toLocaleDateString([], { dateStyle: "medium" })}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Stars value={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{review.comment}</p>
                  )}
                </article>
              ))}
              {reviews.length === 0 && (
                <p className="text-sm text-ink/70">
                  No reviews yet. Be the first to share your thoughts.
                </p>
              )}
            </div>
          </div>

          <div className="h-fit border border-ink/10 p-6 md:col-span-4 md:col-start-9">
            <h3 className="font-heading text-2xl">Write a review</h3>
            {!user ? (
              <p className="mt-3 text-sm leading-relaxed text-ink/65">
                <Link to="/login" className="text-burgundy-800 underline underline-offset-4">
                  Sign in
                </Link>{" "}
                to share your experience.
              </p>
            ) : (
              <form onSubmit={submitReview} className="mt-4 space-y-4">
                <fieldset>
                  <legend className="text-[10px] uppercase tracking-[0.22em] text-ink/70">Rating</legend>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        aria-pressed={rating === value}
                        className={`flex h-10 w-10 items-center justify-center text-2xl leading-none transition ${
                          value <= rating ? "text-burgundy-800" : "text-ink/30 hover:text-burgundy-800/60"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-ink/70">
                    Your thoughts
                  </span>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={4}
                    className="mt-2 w-full border border-ink/20 bg-transparent p-3 text-sm focus:border-burgundy-800 focus:outline-none"
                    placeholder="Optional"
                  />
                </label>
                <Button type="submit" className="w-full">
                  Post Review
                </Button>
                <p className="text-xs text-ink/70">One review per product. Verified orders are labelled.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span aria-label={`${value} out of 5 stars`} className="text-burgundy-800">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: size }}>
          {n <= Math.round(value) ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pt-24 md:px-10 md:pt-28" aria-live="polite">
      <span className="sr-only">Loading the drink</span>
      <div className="grid gap-10 md:grid-cols-12 md:gap-8 lg:gap-14">
        <div className="md:col-span-6 lg:col-span-5">
          <Skeleton className="aspect-[4/5]" />
        </div>
        <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-12 w-3/4" />
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-8 h-16 w-full" />
          <Skeleton className="mt-6 h-20 w-full" />
          <Skeleton className="mt-4 h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
