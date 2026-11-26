import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiBell } from "react-icons/fi";
import { api } from "../../services/api";
import { Container, Section } from "../../components/ui/Container";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Button } from "../../components/ui/Button";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useAuth } from "../../context/AuthContext";

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stars, setStars] = useState<number | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.allSettled([
      api.get("/loyalty/me/").then((r) => setStars(r.data.stars)),
      api.get("/orders/my_orders/").then((r) => setOrders(r.data)),
      api.get("/menu/favorites/").then((r) => setFavorites(r.data.results ?? r.data)),
      api.get("/notifications/unread-count/").then((r) => setUnread(Number(r.data?.count) || 0)),
    ]).finally(() => setLoading(false));
  }, [user]);

  const reorder = (order: any) => {
    const cart = order.items.map((i: any) => ({
      product_id: i.product, product_name: i.product_name, size_id: i.size, size_name: i.size_name,
      quantity: i.quantity, hot_iced: i.hot_iced, milk: i.milk, sugar: i.sugar,
      addons: i.addons || [], notes: i.notes, unit_price: Number(i.unit_price),
    }));
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <SectionHeading
            level={1}
            eyebrow="Account"
            title={user ? `Hello, ${user.first_name || "there"}.` : "Your Filo account."}
            copy={user ? "Your rewards, orders, and details." : "Sign in to view your orders and rewards."}
          />
          {!user ? (
            <div className="mt-8 flex gap-4">
              <Link to="/login"><Button>Sign In</Button></Link>
              <Link to="/register"><Button variant="secondary">Create Account</Button></Link>
            </div>
          ) : (
            <>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link to="/rewards" className="border border-ink/10 p-6 transition hover:border-burgundy-800">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-ink/65">Rewards</p>
                  {loading ? <Skeleton className="mt-4 h-7 w-20" /> : <p className="mt-3 font-heading text-3xl">{stars ?? 0} stars</p>}
                </Link>
                <Link to="/notifications" className="border border-ink/10 p-6 transition hover:border-burgundy-800">
                  <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink/65">
                    <FiBell size={13} /> Notifications
                  </p>
                  {loading ? (
                    <Skeleton className="mt-4 h-7 w-24" />
                  ) : (
                    <p className="mt-3 font-heading text-3xl">{unread > 0 ? `${unread} new` : "All read"}</p>
                  )}
                </Link>
                <div className="border border-ink/10 p-6">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-ink/65">Profile</p>
                  <p className="mt-3 break-words text-sm">{user.email}</p>
                  <p className="text-sm text-ink/65">{user.mobile || "No mobile number on file"}</p>
                </div>
                <button onClick={() => { logout(); navigate("/"); }} className="border border-ink/10 p-6 text-left transition hover:border-burgundy-800">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-ink/65">Session</p>
                  <p className="mt-3 font-heading text-3xl">Sign out</p>
                </button>
              </div>

              <div className="mt-14">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-heading text-3xl">Favorites</h2>
                  <Link to="/menu" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-burgundy-800">
                    Browse menu <FiArrowRight size={12} />
                  </Link>
                </div>
                {loading ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState title="No favorites yet." copy="Tap the heart on a drink to keep it close." />
                  </div>
                ) : (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((f) => (
                      <Link key={f.id} to={`/product/${f.product}`} className="flex items-center gap-4 border border-ink/10 p-4 text-sm transition hover:border-burgundy-800">
                        <span className="font-heading text-lg">{f.product_detail?.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-14">
                <h2 className="font-heading text-3xl">Order history</h2>
                {loading ? (
                  <div className="mt-6 space-y-4">
                    {[0, 1].map((i) => <Skeleton key={i} className="h-20" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState title="No orders yet." copy="Your past orders will appear here." />
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {orders.map((o) => (
                      <div key={o.id} className="border border-ink/10 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                          <span className="font-mono text-xs">{o.order_code}</span>
                          <span className="capitalize text-ink/65">{o.status.replace("_", " ")}</span>
                          <span>₱{o.total}</span>
                          <span className="text-ink/65">{new Date(o.created_at).toLocaleDateString()}</span>
                          <Button variant="secondary" size="sm" onClick={() => reorder(o)}>Reorder</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </Container>
      </Section>
    </div>
  );
}
