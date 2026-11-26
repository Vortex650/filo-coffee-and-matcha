import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { Container, Section } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { FiHeart } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import { business, ORDERING_ENABLED } from "../../content/site";

const MILK_OPTIONS = ["Whole", "Oat", "Almond", "Soy"];
const SUGAR_OPTIONS = ["0%", "25%", "50%", "75%", "100%"];

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [sizeId, setSizeId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [hotIced, setHotIced] = useState("");
  const [milk, setMilk] = useState("");
  const [sugar, setSugar] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [favorite, setFavorite] = useState(false);
  const [favId, setFavId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const loadReviews = () => api.get(`/reviews/?product=${id}`).then((r) => setReviews(r.data.results ?? r.data)).catch(() => {});

  useEffect(() => {
    api.get(`/menu/products/${id}/`).then((r) => setProduct(r.data)).catch(() => setError("Product not found."));
    loadReviews();
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { toast("Please choose a rating.", "error"); return; }
    try {
      await api.post("/reviews/", { product: Number(id), rating, comment });
      setRating(0); setComment("");
      toast("Thank you — your review has been posted.");
      loadReviews();
      api.get(`/menu/products/${id}/`).then((r) => setProduct(r.data)).catch(() => {});
    } catch (err: any) {
      toast(err?.response?.data?.detail || "Could not post your review. You may have already reviewed this item.", "error");
    }
  };

  const Stars = ({ value, size = 14 }: { value: number; size?: number }) => (
    <span aria-label={`${value} out of 5 stars`} className="text-filo-red">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: size }}>{n <= Math.round(value) ? "★" : "☆"}</span>
      ))}
    </span>
  );

  useEffect(() => {
    if (!user) return;
    api.get("/menu/favorites/").then((r) => {
      const list = r.data.results ?? r.data;
      const found = list.find((f: any) => String(f.product) === String(id));
      if (found) { setFavorite(true); setFavId(found.id); }
    }).catch(() => {});
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) return;
    if (favorite && favId) { await api.delete(`/menu/favorites/${favId}/`); setFavorite(false); setFavId(null); }
    else { const r = await api.post("/menu/favorites/", { product: Number(id) }); setFavorite(true); setFavId(r.data.id); }
  };

  const size = product?.sizes?.find((s: any) => s.id === sizeId);
  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const base = Number(product.base_price);
    const sizeAdj = Number(size?.price_adjustment || 0);
    const addonTotal = selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
    return base + sizeAdj + addonTotal;
  }, [product, size, selectedAddons]);

  const toggleAddon = (addon: any) => {
    setSelectedAddons((prev) => prev.some((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]);
  };

  const add = () => {
    if (!product.is_available) return setError("This item is currently unavailable.");
    if (product.allows_hot_iced && !hotIced) return setError("Please choose hot or iced.");
    if (product.sizes?.length > 0 && !sizeId) return setError("Please choose a size.");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({
      product_id: product.id,
      product_name: product.name,
      size_id: sizeId,
      size_name: size?.name || "",
      quantity: qty,
      hot_iced: hotIced,
      milk,
      sugar,
      addons: selectedAddons.map((a) => ({ id: a.id, name: a.name, price: Number(a.price) })),
      notes,
      unit_price: unitPrice,
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  if (error && !product) return <div className="flex min-h-screen items-center justify-center bg-filo-cream"><p className="text-sm text-ink/65">{error}</p></div>;
  if (!product) return <div className="flex min-h-screen items-center justify-center bg-filo-cream"><p className="text-sm text-ink/65">Loading…</p></div>;

  const field = "w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-filo-red";
  const label = "text-[11px] uppercase tracking-[0.2em] text-ink/65";

  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <Link to="/menu" className="text-[11px] uppercase tracking-[0.2em] text-ink/65 hover:text-filo-red">← Back to menu</Link>
          <div className="mt-8 grid gap-12 md:grid-cols-2 md:gap-16">
            <div className="aspect-[4/5] overflow-hidden bg-ink/5 md:sticky md:top-28 md:self-start">
              <img src={product.image_url || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80"} alt={product.image_url ? product.name : `Placeholder: ${product.name}`} className="h-full w-full object-cover" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-filo-red">{product.category?.name}</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <h1 className="font-heading text-4xl md:text-5xl">{product.name}</h1>
                {user && (
                  <button onClick={toggleFavorite} aria-label={favorite ? "Remove from favorites" : "Add to favorites"} aria-pressed={favorite} className={`mt-2 transition ${favorite ? "text-filo-red" : "text-ink/65 hover:text-filo-red"}`}>
                    <FiHeart size={22} fill={favorite ? "currentColor" : "none"} />
                  </button>
                )}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink/65">{product.description}</p>
              <p className="mt-6 font-heading text-3xl">₱{unitPrice.toFixed(2)}</p>

              <div className="mt-8 space-y-6">
                {product.allows_hot_iced && (
                  <div>
                    <p className={label}>Temperature</p>
                    <div className="mt-3 flex gap-3">
                      {["hot", "iced"].map((t) => (
                        <button key={t} onClick={() => setHotIced(t)} className={`border px-5 py-2 text-sm capitalize transition ${hotIced === t ? "border-filo-red bg-filo-red text-filo-cream" : "border-ink/20 hover:border-ink/40"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes?.length > 0 && (
                  <div>
                    <p className={label}>Size</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {product.sizes.map((s: any) => (
                        <button key={s.id} onClick={() => setSizeId(s.id)} className={`border px-5 py-2 text-sm transition ${sizeId === s.id ? "border-filo-red bg-filo-red text-filo-cream" : "border-ink/20 hover:border-ink/40"}`}>
                          {s.name}{Number(s.price_adjustment) > 0 ? ` +₱${s.price_adjustment}` : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.allows_milk && (
                  <div>
                    <p className={label}>Milk</p>
                    <select aria-label="Milk" value={milk} onChange={(e) => setMilk(e.target.value)} className={`${field} mt-3`}>
                      <option value="">Default</option>
                      {MILK_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}

                {product.allows_sugar && (
                  <div>
                    <p className={label}>Sugar level</p>
                    <select aria-label="Sugar level" value={sugar} onChange={(e) => setSugar(e.target.value)} className={`${field} mt-3`}>
                      <option value="">Default</option>
                      {SUGAR_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {product.addons?.length > 0 && (
                  <div>
                    <p className={label}>Add-ons</p>
                    <div className="mt-3 space-y-2">
                      {product.addons.map((a: any) => (
                        <label key={a.id} className="flex cursor-pointer items-center justify-between border border-ink/10 px-4 py-3 text-sm">
                          <span className="flex items-center gap-3">
                            <input type="checkbox" checked={selectedAddons.some((x) => x.id === a.id)} onChange={() => toggleAddon(a)} />
                            {a.name}
                          </span>
                          <span className="text-ink/65">+₱{a.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={label}>Quantity</p>
                    <div className="mt-3 flex items-center border border-ink/20">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2" aria-label="Decrease quantity">−</button>
                      <span className="flex-1 text-center text-sm">{qty}</span>
                      <button onClick={() => setQty(qty + 1)} className="px-4 py-2" aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                  <div>
                    <p className={label}>Special instructions</p>
                    <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className={`${field} mt-3`} />
                  </div>
                </div>
              </div>

              {error && <p className="mt-6 text-sm text-filo-red" role="alert">{error}</p>}
              {ORDERING_ENABLED ? (
                <div className="mt-8 flex gap-4">
                  <Button onClick={add} disabled={!product.is_available} className="flex-1">Add to Cart · ₱{(unitPrice * qty).toFixed(2)}</Button>
                  <Button variant="secondary" onClick={() => navigate("/cart")}>Cart</Button>
                </div>
              ) : (
                <div className="mt-8 border border-ink/10 bg-ivory/50 p-6">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-ink/65">Opening Soon</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    Online ordering opens at launch. This drink will be available when we open our doors.
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
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-t border-ink/10">
        <Container>
          <div className="grid gap-14 md:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-filo-red">Reviews</p>
              <div className="mt-4 flex flex-wrap items-end gap-4">
                <h2 className="font-heading text-4xl">What people are saying.</h2>
                {product.review_count > 0 && (
                  <span className="mb-1 flex items-center gap-2 text-sm text-ink/65">
                    <Stars value={Number(product.avg_rating)} size={16} /> {product.avg_rating} · {product.review_count} review{product.review_count > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="mt-8 space-y-6">
                {reviews.map((r) => (
                  <article key={r.id} className="border-b border-ink/10 pb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{r.user_name}</span>
                        {r.is_verified && <span className="border border-matcha/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-matcha">Verified order</span>}
                      </div>
                      <span className="text-xs text-ink/65">{new Date(r.created_at).toLocaleDateString([], { dateStyle: "medium" })}</span>
                    </div>
                    <div className="mt-2"><Stars value={r.rating} /></div>
                    {r.comment && <p className="mt-3 text-sm leading-relaxed text-ink/70">{r.comment}</p>}
                  </article>
                ))}
                {reviews.length === 0 && <p className="text-sm text-ink/65">No reviews yet. Be the first to share your thoughts.</p>}
              </div>
            </div>

            <div className="h-fit border border-ink/10 p-6">
              <h3 className="font-heading text-2xl">Write a review</h3>
              {!user ? (
                <p className="mt-3 text-sm text-ink/65">
                  <Link to="/login" className="text-filo-red underline underline-offset-4">Sign in</Link> to share your experience.
                </p>
              ) : (
                <form onSubmit={submitReview} className="mt-4 space-y-4">
                  <fieldset>
                    <legend className="text-[11px] uppercase tracking-[0.2em] text-ink/65">Rating</legend>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          aria-label={`${n} star${n > 1 ? "s" : ""}`}
                          aria-pressed={rating === n}
                          className={`text-2xl leading-none transition ${n <= rating ? "text-filo-red" : "text-ink/65 hover:text-filo-red/60"}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-ink/65">Your thoughts</span>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className={`${field} mt-2`} placeholder="Optional" />
                  </label>
                  <Button type="submit" className="w-full">Post Review</Button>
                  <p className="text-xs text-ink/65">One review per product. Verified orders are labelled.</p>
                </form>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
