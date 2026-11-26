import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";

export default function AdminInventory() {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", unit: "g", stock_quantity: "", minimum_threshold: "", cost_per_unit: "" });
  const [show, setShow] = useState(false);
  const [stocking, setStocking] = useState<number | null>(null);
  const [stockQty, setStockQty] = useState("");
  const [recipe, setRecipe] = useState({ product: "", ingredient: "", quantity: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      api.get("/inventory/ingredients/").then((r) => setItems(r.data.results ?? r.data)),
      api.get("/menu/products/").then((r) => setProducts(r.data.results ?? r.data)),
      api.get("/inventory/recipes/").then((r) => setRecipes(r.data.results ?? r.data)),
    ]).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const low = useMemo(() => items.filter((i) => i.is_low), [items]);
  const productName = (id: number) => products.find((p) => p.id === id)?.name ?? `Product ${id}`;
  const ingredientName = (id: number) => items.find((i) => i.id === id)?.name ?? `Ingredient ${id}`;

  const saveIngredient = async () => {
    if (!form.name.trim()) { setError("Ingredient name is required."); return; }
    try {
      await api.post("/inventory/ingredients/", form);
      setShow(false);
      setForm({ name: "", unit: "g", stock_quantity: "", minimum_threshold: "", cost_per_unit: "" });
      setError("");
      toast("Ingredient added.");
      load();
    } catch { setError("Could not save ingredient."); }
  };

  const stockIn = async (id: number) => {
    if (!stockQty) return;
    try {
      await api.post(`/inventory/ingredients/${id}/stock_in/`, { quantity: stockQty });
      setStocking(null); setStockQty("");
      toast("Stock updated.");
      load();
    } catch {
      toast("Could not update stock.", "error");
    }
  };

  const addRecipe = async () => {
    if (!recipe.product || !recipe.ingredient || !recipe.quantity) { setError("Choose a product, ingredient, and quantity."); return; }
    try {
      await api.post("/inventory/recipes/", {
        product: Number(recipe.product), ingredient: Number(recipe.ingredient), quantity: recipe.quantity,
      });
      setRecipe({ product: "", ingredient: "", quantity: "" });
      setError("");
      toast("Recipe item added.");
      load();
    } catch { setError("Could not add recipe item. It may already exist for this product."); }
  };

  const removeRecipe = async (id: number) => {
    try {
      await api.delete(`/inventory/recipes/${id}/`);
      toast("Recipe item removed.");
      load();
    } catch {
      toast("Could not remove the recipe item.", "error");
    }
  };

  const field = "w-full border border-ink/20 bg-transparent p-2 text-sm focus:border-filo-red focus:outline-none";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-4xl">Inventory</h1>
        <button onClick={() => setShow(!show)} className="bg-filo-red px-4 py-2 text-xs uppercase tracking-[0.15em] text-filo-cream">
          {show ? "Close" : "Add Ingredient"}
        </button>
      </div>

      {low.length > 0 && (
        <p className="mt-4 border-l-2 border-filo-red bg-filo-red/5 px-4 py-3 text-sm text-ink/70" role="status">
          {low.length} ingredient{low.length > 1 ? "s" : ""} at or below minimum: {low.map((i) => i.name).join(", ")}.
        </p>
      )}

      {show && (
        <div className="mt-6 grid gap-3 border border-ink/10 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <input aria-label="Ingredient name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
          <select aria-label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={field}><option>g</option><option>ml</option><option>pcs</option></select>
          <input aria-label="Opening stock quantity" placeholder="Stock quantity" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className={field} />
          <input aria-label="Minimum threshold" placeholder="Minimum threshold" value={form.minimum_threshold} onChange={(e) => setForm({ ...form, minimum_threshold: e.target.value })} className={field} />
          <input aria-label="Cost per unit" placeholder="Cost per unit" value={form.cost_per_unit} onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })} className={field} />
          <button onClick={saveIngredient} className="bg-ink px-4 py-2 text-xs uppercase tracking-[0.15em] text-filo-cream">Save Ingredient</button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-filo-red" role="alert">{error}</p>}

      <div className="mt-8 space-y-2">
        {loading && (
          <div className="space-y-2" aria-live="polite">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}
            <span className="sr-only">Loading inventory</span>
          </div>
        )}
        {!loading && items.map((i) => (
          <div key={i.id} className={`border p-4 text-sm ${i.is_low ? "border-filo-red" : "border-ink/10"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="min-w-40 font-medium">{i.name}</span>
              <span className={i.is_low ? "text-filo-red" : "text-ink/65"}>{i.stock_quantity} {i.unit} {i.is_low && "· low stock"}</span>
              <span className="text-ink/65">min {i.minimum_threshold} {i.unit}</span>
              <button onClick={() => { setStocking(stocking === i.id ? null : i.id); setStockQty(""); }} className="text-xs uppercase tracking-[0.12em] text-filo-red">Stock in</button>
            </div>
            {stocking === i.id && (
              <div className="mt-3 flex gap-2">
                <label className="flex-1">
                  <span className="sr-only">Quantity to add for {i.name}</span>
                  <input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder={`Quantity in ${i.unit}`} className={field} />
                </label>
                <button onClick={() => stockIn(i.id)} className="bg-ink px-4 py-2 text-xs uppercase tracking-[0.15em] text-filo-cream">Add</button>
              </div>
            )}
          </div>
        ))}
        {!loading && items.length === 0 && (
          <EmptyState title="No ingredients yet." copy="Add coffee beans, matcha, milk, cups, and more." />
        )}
      </div>

      <section className="mt-14">
        <h2 className="font-heading text-3xl">Recipes</h2>
        <p className="mt-2 max-w-lg text-sm text-ink/65">
          Set how much of each ingredient a drink uses. When an order is completed and inventory deductions are enabled, stock is reduced automatically and exactly once.
        </p>

        <div className="mt-6 grid gap-3 border border-ink/10 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <select value={recipe.product} onChange={(e) => setRecipe({ ...recipe, product: e.target.value })} className={field} aria-label="Product">
            <option value="">Product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={recipe.ingredient} onChange={(e) => setRecipe({ ...recipe, ingredient: e.target.value })} className={field} aria-label="Ingredient">
            <option value="">Ingredient</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
          </select>
          <input type="number" step="0.001" value={recipe.quantity} onChange={(e) => setRecipe({ ...recipe, quantity: e.target.value })} placeholder="Quantity used" aria-label="Quantity used" className={field} />
          <button onClick={addRecipe} className="bg-ink px-4 py-2 text-xs uppercase tracking-[0.15em] text-filo-cream">Add Recipe Item</button>
        </div>

        <div className="mt-6 space-y-2">
          {recipes.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 p-4 text-sm">
              <span className="min-w-40">{productName(r.product)}</span>
              <span className="text-ink/65">{r.quantity} × {ingredientName(r.ingredient)}</span>
              <button onClick={() => removeRecipe(r.id)} className="text-xs uppercase tracking-[0.12em] text-ink/65 hover:text-filo-red">Remove</button>
            </div>
          ))}
          {!loading && recipes.length === 0 && (
            <EmptyState title="No recipe items yet." copy="Add an ingredient to a product to deduct stock automatically." />
          )}
        </div>
      </section>
    </div>
  );
}
