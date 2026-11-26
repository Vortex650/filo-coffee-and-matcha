import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";

const empty = { name: "", category: "", description: "", base_price: "", image_url: "", is_available: true, is_featured: false, is_best_seller: false, allows_hot_iced: false, allows_milk: false, allows_sugar: false, is_stamp_eligible: true, display_order: 0 };

export default function AdminMenu() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      api.get("/menu/products/").then((r) => setProducts(r.data.results ?? r.data)),
      api.get("/menu/categories/").then((r) => setCategories(r.data.results ?? r.data)),
    ]).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...empty, category: categories[0]?.id || "" }); setEditing(null); setOpen(true); setError(""); };
  const openEdit = (p: any) => { setForm({ ...p, category: p.category }); setEditing(p.id); setOpen(true); setError(""); };

  const save = async () => {
    if (!form.name || !form.category || !form.base_price) { setError("Name, category, and price are required."); return; }
    const payload = { ...form, category: Number(form.category), base_price: form.base_price, display_order: Number(form.display_order) };
    try {
      if (editing) await api.patch(`/menu/products/${editing}/`, payload);
      else await api.post("/menu/products/", payload);
      setOpen(false);
      toast(editing ? "Product updated." : "Product added.");
      load();
    } catch { setError("Could not save. Check the fields and permissions."); }
  };

  const archive = async (p: any) => {
    try {
      await api.patch(`/menu/products/${p.id}/`, { is_available: !p.is_available });
      toast(p.is_available ? "Product archived." : "Product restored.");
      load();
    } catch {
      toast("Could not update the product.", "error");
    }
  };

  const field = "w-full border border-ink/20 bg-transparent p-2 text-sm focus:border-filo-red focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-4xl">Menu</h1>
        <button onClick={openNew} className="bg-filo-red px-4 py-2 text-xs uppercase tracking-[0.15em] text-filo-cream">Add Product</button>
      </div>

      <div className="mt-8 space-y-2">
        {loading && (
          <div className="space-y-2" aria-live="polite">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}
            <span className="sr-only">Loading products</span>
          </div>
        )}
        {!loading && products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 p-4 text-sm">
            <span className="min-w-40">{p.name}</span>
            <span className="text-ink/65">₱{p.base_price}</span>
            <span className={`text-xs ${p.is_available ? "text-ink/65" : "text-filo-red"}`}>{p.is_available ? "Available" : "Unavailable"}</span>
            <div className="flex gap-3">
              <button onClick={() => openEdit(p)} className="text-xs uppercase tracking-[0.12em] text-filo-red">Edit</button>
              <button onClick={() => archive(p)} className="text-xs uppercase tracking-[0.12em] text-ink/65">{p.is_available ? "Archive" : "Restore"}</button>
            </div>
          </div>
        ))}
        {!loading && products.length === 0 && (
          <EmptyState title="No products yet." copy="Add your first coffee, matcha, or seasonal drink." />
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit product" : "Add product"}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-filo-cream p-6">
            <h2 className="font-heading text-2xl">{editing ? "Edit product" : "New product"}</h2>
            <div className="mt-5 space-y-4">
              <div><label htmlFor="product-name" className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Name</label><input id="product-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${field} mt-1`} /></div>
              <div><label htmlFor="product-category" className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Category</label>
                <select id="product-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`${field} mt-1`}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label htmlFor="product-description" className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Description</label><textarea id="product-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${field} mt-1`} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label htmlFor="product-price" className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Price</label><input id="product-price" type="number" step="0.01" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} className={`${field} mt-1`} /></div>
                <div><label htmlFor="product-order" className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Display order</label><input id="product-order" type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className={`${field} mt-1`} /></div>
              </div>
              <div><label htmlFor="product-image" className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Image URL</label><input id="product-image" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={`${field} mt-1`} /></div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[["is_available", "Available"], ["is_featured", "Featured"], ["is_best_seller", "Best seller"], ["allows_hot_iced", "Hot / Iced"], ["allows_milk", "Milk options"], ["allows_sugar", "Sugar levels"], ["is_stamp_eligible", "Stamp eligible"]].map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={!!form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} /> {label}</label>
                ))}
              </div>
              {error && <p className="text-sm text-filo-red" role="alert">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setOpen(false)} className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-ink/65">Cancel</button>
                <button onClick={save} className="bg-filo-red px-4 py-2 text-xs uppercase tracking-[0.15em] text-filo-cream">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
