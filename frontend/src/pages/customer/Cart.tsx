import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Section } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";

export default function Cart() {
  const [cart, setCart] = useState<any[]>(JSON.parse(localStorage.getItem("cart") || "[]"));
  const navigate = useNavigate();

  const persist = (c: any[]) => { setCart(c); localStorage.setItem("cart", JSON.stringify(c)); };
  const remove = (i: number) => { const c = [...cart]; c.splice(i, 1); persist(c); };
  const setQty = (i: number, qty: number) => { const c = [...cart]; c[i].quantity = Math.max(1, qty); persist(c); };

  const subtotal = cart.reduce((s, i) => s + (i.unit_price || 0) * (i.quantity || 1), 0);

  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <h1 className="font-heading text-5xl">Your Cart</h1>
          {cart.length === 0 ? (
            <div className="mt-12 border border-ink/10 p-12 text-center">
              <p className="font-heading text-2xl">Your cart is empty.</p>
              <p className="mt-2 text-sm text-ink/65">Find something you love.</p>
              <Link to="/menu" className="mt-6 inline-block"><Button variant="secondary">Browse Menu</Button></Link>
            </div>
          ) : (
            <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-8">
                {cart.map((i, idx) => (
                  <div key={idx} className="flex gap-5 border-b border-ink/10 pb-8">
                    <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-ink/5">
                      <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80" alt="Placeholder: drink" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-heading text-xl">{i.product_name}</p>
                          <p className="mt-1 text-xs text-ink/65">
                            {[i.size_name, i.hot_iced, i.milk && `${i.milk} milk`, i.sugar && `${i.sugar} sugar`].filter(Boolean).join(" · ")}
                          </p>
                          {i.addons?.length > 0 && <p className="mt-1 text-xs text-ink/65">Add-ons: {i.addons.map((a: any) => a.name).join(", ")}</p>}
                          {i.notes && <p className="mt-1 text-xs italic text-ink/65">“{i.notes}”</p>}
                        </div>
                        <span className="text-sm font-medium">₱{((i.unit_price || 0) * (i.quantity || 1)).toFixed(2)}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-6">
                        <div className="flex items-center border border-ink/20">
                          <button onClick={() => setQty(idx, i.quantity - 1)} className="px-3 py-1" aria-label="Decrease quantity">−</button>
                          <span className="w-8 text-center text-sm">{i.quantity}</span>
                          <button onClick={() => setQty(idx, i.quantity + 1)} className="px-3 py-1" aria-label="Increase quantity">+</button>
                        </div>
                        <button onClick={() => remove(idx)} className="text-xs uppercase tracking-[0.15em] text-ink/65 hover:text-filo-red">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-fit border border-ink/10 p-6 lg:sticky lg:top-28">
                <h2 className="font-heading text-2xl">Summary</h2>
                <div className="mt-6 space-y-3 text-sm text-ink/70">
                  <div className="flex justify-between"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Discounts</span><span>Applied at checkout</span></div>
                </div>
                <div className="mt-5 flex justify-between border-t border-ink/10 pt-5 font-heading text-xl"><span>Total</span><span>₱{subtotal.toFixed(2)}</span></div>
                <Button className="mt-6 w-full" onClick={() => navigate("/checkout")}>Proceed to Checkout</Button>
                <Link to="/menu" className="mt-4 block text-center text-xs uppercase tracking-[0.15em] text-ink/65 hover:text-filo-red">Continue shopping</Link>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
