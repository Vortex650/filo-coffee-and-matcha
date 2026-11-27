import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";
import ProductCustomizationEditor from "../../components/admin/ProductCustomizationEditor";

const STATUS_OPTIONS = [
  ["available", "Available"],
  ["sold_out", "Sold out"],
  ["unavailable", "Temporarily unavailable"],
  ["seasonal", "Seasonal"],
  ["hidden", "Hidden"],
] as const;

const empty = {
  name: "",
  category: "",
  description: "",
  story: "",
  flavor_notes: "",
  ingredients: "",
  allergens: "",
  tagsText: "",
  base_price: "",
  image_url: "",
  availability_status: "available",
  availability_note: "",
  is_available: true,
  is_featured: false,
  is_best_seller: false,
  is_new: false,
  is_seasonal: false,
  is_signature: false,
  is_placeholder: false,
  is_stamp_eligible: true,
  allows_hot_iced: false,
  allows_milk: false,
  allows_sugar: false,
  display_order: 0,
};

const field =
  "w-full border border-ink/20 bg-transparent p-2 text-sm focus:border-filo-red focus:outline-none";
const labelClass = "text-[10px] uppercase tracking-[0.18em] text-ink/65";

function buildPayload(form: any) {
  return {
    name: form.name,
    category: Number(form.category),
    description: form.description,
    story: form.story,
    flavor_notes: form.flavor_notes,
    ingredients: form.ingredients,
    allergens: form.allergens,
    tags: String(form.tagsText || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    base_price: form.base_price,
    image_url: form.image_url,
    availability_status: form.availability_status,
    availability_note: form.availability_note,
    is_available: form.is_available,
    is_featured: form.is_featured,
    is_best_seller: form.is_best_seller,
    is_new: form.is_new,
    is_seasonal: form.is_seasonal,
    is_signature: form.is_signature,
    is_placeholder: form.is_placeholder,
    is_stamp_eligible: form.is_stamp_eligible,
    allows_hot_iced: form.allows_hot_iced,
    allows_milk: form.allows_milk,
    allows_sugar: form.allows_sugar,
    display_order: Number(form.display_order) || 0,
  };
}

export default function AdminMenu() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAll = async (path: string) => {
    const rows: any[] = [];
    let page = 1;
    while (page <= 40) {
      const { data } = await api.get(`${path}?page=${page}`);
      rows.push(...(data.results ?? data));
      if (!data.next || !data.results) break;
      page += 1;
    }
    return rows;
  };

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      loadAll("/menu/products/").then(setProducts),
      loadAll("/menu/categories/").then(setCategories),
    ]).finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!open && !customizing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setCustomizing(null);
      }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, customizing]);

  const openNew = () => {
    setForm({ ...empty, category: categories[0]?.id || "" });
    setEditing(null);
    setOpen(true);
    setError("");
  };

  const openEdit = (p: any) => {
    setForm({
      ...empty,
      ...p,
      category: p.category,
      tagsText: (p.tags || []).join(", "),
      availability_status: p.availability_status || "available",
    });
    setEditing(p.id);
    setOpen(true);
    setError("");
  };

  const save = async () => {
    if (!form.name || !form.category || !form.base_price) {
      setError("Name, category, and price are required.");
      return;
    }
    const payload = buildPayload(form);
    try {
      if (editing) await api.patch(`/menu/products/${editing}/`, payload);
      else await api.post("/menu/products/", payload);
      setOpen(false);
      toast(editing ? "Product updated." : "Product added.");
      load();
    } catch {
      setError("Could not save. Check the fields and permissions.");
    }
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

  const toggle = (key: string, label: string) => (
    <label key={key} className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={!!form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
      />
      {label}
    </label>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-4xl">Menu</h1>
        <button
          onClick={openNew}
          className="bg-filo-red px-4 py-2 text-xs uppercase tracking-[0.15em] text-filo-cream"
        >
          Add Product
        </button>
      </div>

      <div className="mt-8 space-y-2">
        {loading && (
          <div className="space-y-2" aria-live="polite">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
            <span className="sr-only">Loading products</span>
          </div>
        )}
        {!loading &&
          products.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-ink/10 p-4 text-sm"
            >
              <div className="min-w-40 flex-1">
                <p>{p.name}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-ink/60">
                  {p.category_name} · {p.availability_status?.replace("_", " ")}
                  {p.is_placeholder ? " · sample" : ""}
                </p>
              </div>
              <span className="text-ink/65">₱{p.base_price}</span>
              <span
                className={`text-xs ${p.is_available ? "text-ink/65" : "text-filo-red"}`}
              >
                {p.is_available ? "Available" : "Unavailable"}
              </span>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => openEdit(p)}
                  className="text-xs uppercase tracking-[0.12em] text-filo-red"
                >
                  Edit
                </button>
                <button
                  onClick={() => setCustomizing(p)}
                  className="text-xs uppercase tracking-[0.12em] text-filo-red"
                >
                  Customize
                </button>
                <button
                  onClick={() => archive(p)}
                  className="text-xs uppercase tracking-[0.12em] text-ink/65"
                >
                  {p.is_available ? "Archive" : "Restore"}
                </button>
              </div>
            </div>
          ))}
        {!loading && products.length === 0 && (
          <EmptyState
            title="No products yet."
            copy="Add your first coffee, matcha, or seasonal drink."
          />
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Edit product" : "Add product"}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-filo-cream p-6">
            <h2 className="font-heading text-2xl">{editing ? "Edit product" : "New product"}</h2>
            <div className="mt-5 space-y-6">
              <section className="space-y-4">
                <div>
                  <label htmlFor="product-name" className={labelClass}>
                    Name
                  </label>
                  <input
                    id="product-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`${field} mt-1`}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="product-category" className={labelClass}>
                      Category
                    </label>
                    <select
                      id="product-category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={`${field} mt-1`}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="product-price" className={labelClass}>
                      Base price
                    </label>
                    <input
                      id="product-price"
                      type="number"
                      step="0.01"
                      value={form.base_price}
                      onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                      className={`${field} mt-1`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="product-description" className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id="product-description"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${field} mt-1`}
                  />
                </div>
                <div>
                  <label htmlFor="product-story" className={labelClass}>
                    Story
                  </label>
                  <textarea
                    id="product-story"
                    rows={2}
                    value={form.story}
                    onChange={(e) => setForm({ ...form, story: e.target.value })}
                    className={`${field} mt-1`}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="product-notes" className={labelClass}>
                      Flavor notes
                    </label>
                    <input
                      id="product-notes"
                      value={form.flavor_notes}
                      onChange={(e) => setForm({ ...form, flavor_notes: e.target.value })}
                      className={`${field} mt-1`}
                    />
                  </div>
                  <div>
                    <label htmlFor="product-tags" className={labelClass}>
                      Tags · comma separated
                    </label>
                    <input
                      id="product-tags"
                      value={form.tagsText}
                      onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
                      placeholder="coffee, matcha, seasonal"
                      className={`${field} mt-1`}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="product-ingredients" className={labelClass}>
                      Ingredients
                    </label>
                    <textarea
                      id="product-ingredients"
                      rows={2}
                      value={form.ingredients}
                      onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                      className={`${field} mt-1`}
                    />
                  </div>
                  <div>
                    <label htmlFor="product-allergens" className={labelClass}>
                      Allergens
                    </label>
                    <textarea
                      id="product-allergens"
                      rows={2}
                      value={form.allergens}
                      onChange={(e) => setForm({ ...form, allergens: e.target.value })}
                      className={`${field} mt-1`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="product-image" className={labelClass}>
                    Image URL
                  </label>
                  <input
                    id="product-image"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className={`${field} mt-1`}
                  />
                </div>
              </section>

              <section className="space-y-4 border-t border-ink/10 pt-5">
                <h3 className="font-heading text-xl">Availability</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="product-status" className={labelClass}>
                      Status
                    </label>
                    <select
                      id="product-status"
                      value={form.availability_status}
                      onChange={(e) =>
                        setForm({ ...form, availability_status: e.target.value })
                      }
                      className={`${field} mt-1`}
                    >
                      {STATUS_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="product-display-order" className={labelClass}>
                      Display order
                    </label>
                    <input
                      id="product-display-order"
                      type="number"
                      value={form.display_order}
                      onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                      className={`${field} mt-1`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="product-availability-note" className={labelClass}>
                    Availability note · optional
                  </label>
                  <input
                    id="product-availability-note"
                    value={form.availability_note}
                    onChange={(e) => setForm({ ...form, availability_note: e.target.value })}
                    className={`${field} mt-1`}
                  />
                </div>
                <p className="text-xs leading-relaxed text-ink/60">
                  A product can be ordered only when it is available and its status is
                  “Available”. Hidden products never appear on the storefront.
                </p>
              </section>

              <section className="border-t border-ink/10 pt-5">
                <h3 className="font-heading text-xl">Labels &amp; options</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {toggle("is_available", "Available")}
                  {toggle("is_featured", "Featured")}
                  {toggle("is_best_seller", "Best seller")}
                  {toggle("is_new", "New")}
                  {toggle("is_seasonal", "Seasonal")}
                  {toggle("is_signature", "Signature")}
                  {toggle("is_placeholder", "Sample / placeholder data")}
                  {toggle("is_stamp_eligible", "Stamp eligible")}
                  {toggle("allows_hot_iced", "Legacy hot / iced toggle")}
                  {toggle("allows_milk", "Legacy milk toggle")}
                  {toggle("allows_sugar", "Legacy sugar toggle")}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink/60">
                  Legacy toggles are kept for older data. Use Customize to manage the real
                  option groups, sizes, and add-ons.
                </p>
              </section>

              {error && (
                <p className="text-sm text-filo-red" role="alert">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-3 border-t border-ink/10 pt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-ink/65"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="bg-filo-red px-4 py-2 text-xs uppercase tracking-[0.15em] text-filo-cream"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {customizing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Customize ${customizing.name}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) setCustomizing(null);
          }}
        >
          <ProductCustomizationEditor
            product={customizing}
            onClose={() => {
              setCustomizing(null);
              load();
            }}
          />
        </div>
      )}
    </div>
  );
}
