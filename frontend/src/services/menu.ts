import { api } from "./api";
import { images } from "../content/site";
import type {
  CustomizationGroup,
  MenuCategory,
  MenuFilters,
  MenuProduct,
  OptionSelection,
  PriceLine,
} from "../types/menu";

const categoryImages: Record<string, { src: string; alt: string }> = {
  "espresso-based": images.momentCoffee,
  matcha: images.momentMatcha,
  "dirty-matcha-blends": images.socialThree,
  "non-coffee": images.socialOne,
  pastries: images.atmosphereTwo,
  food: images.atmosphereTwo,
};

export function productImage(product: MenuProduct) {
  if (product.image_url) return { src: product.image_url, alt: product.name, placeholder: false };
  const fallback =
    categoryImages[product.category_slug || ""] ||
    images.menuFallback;
  return { src: fallback.src, alt: `Placeholder: ${product.name}`, placeholder: true };
}

export function formatPeso(value: number | string) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "₱0.00";
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function fetchMenu() {
  const products: MenuProduct[] = [];
  let page = 1;
  // DRF paginates at 50. Follow every page so the in-memory filters never
  // silently miss products once the real menu grows.
  while (page <= 40) {
    const { data } = await api.get(`/menu/products/?page=${page}`);
    const batch: MenuProduct[] = data.results ?? data;
    products.push(...batch);
    if (!data.next || !data.results) break;
    page += 1;
  }

  const categories: MenuCategory[] = [];
  page = 1;
  while (page <= 10) {
    const { data } = await api.get(`/menu/categories/?page=${page}`);
    const batch: MenuCategory[] = data.results ?? data;
    categories.push(...batch);
    if (!data.next || !data.results) break;
    page += 1;
  }

  return {
    products: products.filter((p) => p.availability_status !== "hidden"),
    categories: categories.filter((c) => c.is_active),
  };
}

export async function fetchProduct(id: string) {
  const { data } = await api.get(`/menu/products/${id}/`);
  return data as MenuProduct;
}

export async function fetchRelated(id: string) {
  const { data } = await api.get(`/menu/products/${id}/related/`);
  return (data.results ?? data) as MenuProduct[];
}

export async function fetchPricePreview(
  id: string,
  payload: {
    size_id?: number | null;
    option_ids?: number[];
    addon_ids?: number[];
    quantity?: number;
  }
) {
  const { data } = await api.post(`/menu/products/${id}/price/`, payload);
  return data as {
    unit_price: string;
    quantity: number;
    line_total: string;
    breakdown: PriceLine[];
  };
}

export function defaultSelections(product: MenuProduct): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const group of product.customization_groups) {
    if (group.selection_type === "multiple") {
      out[group.key] = [];
      continue;
    }
    const available = group.options.filter((o) => o.available);
    const preferred =
      available.find((o) => o.is_default) ||
      available[0] ||
      group.options[0];
    out[group.key] = preferred ? [preferred.key] : [];
  }
  return out;
}

export function selectedOptions(
  groups: CustomizationGroup[],
  selections: Record<string, string[]>
): OptionSelection[] {
  const out: OptionSelection[] = [];
  for (const group of groups) {
    const keys = selections[group.key] || [];
    for (const option of group.options) {
      if (keys.includes(option.key)) out.push(option);
    }
  }
  return out;
}

export function selectedByGroup(
  group: CustomizationGroup,
  selections: Record<string, string[]>
): OptionSelection[] {
  const keys = selections[group.key] || [];
  return group.options.filter((o) => keys.includes(o.key));
}

export function computePrice(product: MenuProduct, selections: Record<string, string[]>) {
  const lines: PriceLine[] = [{ label: "Base", amount: product.base_price }];
  let unit = Number(product.base_price);
  for (const group of product.customization_groups) {
    for (const option of selectedByGroup(group, selections)) {
      const adjustment = Number(option.price_adjustment || 0);
      if (adjustment > 0) {
        unit += adjustment;
        lines.push({ label: option.label, amount: String(adjustment) });
      }
    }
  }
  return { unit, lines };
}

export function selectionPayload(
  product: MenuProduct,
  selections: Record<string, string[]>
) {
  const options = selectedOptions(product.customization_groups, selections);
  const selectedForKind = (kind: string) => {
    const group = product.customization_groups.find((g) => g.kind === kind);
    if (!group) return undefined;
    return selectedByGroup(group, selections)[0];
  };

  const sizeOption = selectedForKind("size");
  const temperature = selectedForKind("temperature");
  const milk = selectedForKind("milk");
  const sugar = selectedForKind("sweetness");

  const addons = options.filter((o) => o.addon_id);
  const custom = options.filter((o) => o.id && !o.addon_id && !o.size_id);

  const groupLabelFor = (option: OptionSelection) =>
    product.customization_groups.find((g) =>
      g.options.some((o) => o.key === option.key && o.id === option.id)
    )?.label || "";

  return {
    size_id: sizeOption?.size_id ?? null,
    size_name: sizeOption?.label || "",
    hot_iced: temperature?.label.toLowerCase() || "",
    milk: milk?.label || "",
    sugar: sugar?.label || "",
    addons: addons.map((a) => ({
      id: a.addon_id,
      name: a.label,
      price: Number(a.price_adjustment),
    })),
    option_ids: custom.map((o) => o.id as number),
    customizations: custom.map((o) => ({
      group: groupLabelFor(o),
      option: o.label,
      price: o.price_adjustment,
    })),
  };
}

export function priceRequest(
  product: MenuProduct,
  selections: Record<string, string[]>,
  quantity = 1
) {
  const options = selectedOptions(product.customization_groups, selections);
  const size = product.customization_groups
    .find((group) => group.kind === "size")
    ?.options.find((option) => (selections.size || []).includes(option.key));

  const optionIds = options
    .filter((option) => option.id && !option.size_id && !option.addon_id)
    .map((option) => option.id as number);
  const addonIds = options
    .map((option) => option.addon_id)
    .filter((id): id is number => typeof id === "number");

  return {
    size_id: size?.size_id ?? null,
    option_ids: optionIds,
    addon_ids: addonIds,
    quantity,
  };
}

export function validateSelections(
  product: MenuProduct,
  selections: Record<string, string[]>
): string | null {
  if (!product.is_orderable) {
    return availabilityCopy(product).title;
  }
  for (const group of product.customization_groups) {
    const count = (selections[group.key] || []).length;
    if (group.required && count < Math.max(1, group.min_select)) {
      return `Please choose ${group.label.toLowerCase()}.`;
    }
    if (group.min_select && count < group.min_select) {
      return `Choose at least ${group.min_select} for ${group.label.toLowerCase()}.`;
    }
    if (group.max_select && count > group.max_select) {
      return `Choose up to ${group.max_select} for ${group.label.toLowerCase()}.`;
    }
  }
  return null;
}

export function availabilityCopy(product: MenuProduct) {
  if (product.availability_status === "sold_out") {
    return {
      title: "Sold out for today.",
      copy: "This drink has sold out. Please explore another from the menu.",
      orderable: false,
    };
  }
  if (product.availability_status === "unavailable") {
    return {
      title: "Temporarily unavailable.",
      copy: product.availability_note || "This drink is taking a short pause. Please check back soon.",
      orderable: false,
    };
  }
  if (product.availability_status === "seasonal") {
    return {
      title: "Seasonal selection.",
      copy: product.availability_note || "Available for a limited season.",
      orderable: product.is_available,
    };
  }
  if (!product.is_available) {
    return {
      title: "Currently unavailable.",
      copy: product.availability_note || "This drink is not available right now.",
      orderable: false,
    };
  }
  return { title: "", copy: "", orderable: true };
}

export function matchesSearch(product: MenuProduct, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    product.name,
    product.description,
    product.story,
    product.flavor_notes,
    product.category_name,
    ...(product.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((part) => haystack.includes(part));
}

export function applyFilters(
  products: MenuProduct[],
  filters: MenuFilters,
  search: string
) {
  const filtered = products.filter((product) => {
    if (filters.category !== "all" && product.category !== filters.category) return false;
    if (!matchesSearch(product, search)) return false;
    if (filters.onlyAvailable && !product.is_orderable) return false;
    if (filters.tags.length) {
      const tags = new Set([
        ...(product.tags || []).map((t) => t.toLowerCase()),
        ...(product.is_best_seller ? ["best-seller"] : []),
        ...(product.is_new ? ["new"] : []),
        ...(product.is_seasonal ? ["seasonal"] : []),
        ...(product.is_signature ? ["signature"] : []),
      ]);
      if (!filters.tags.every((tag) => tags.has(tag))) return false;
    }
    const price = Number(product.base_price);
    if (filters.price === "under-120" && price >= 120) return false;
    if (filters.price === "120-150" && (price < 120 || price > 150)) return false;
    if (filters.price === "over-150" && price <= 150) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "popular":
      sorted.sort(
        (a, b) =>
          Number(b.is_best_seller) - Number(a.is_best_seller) ||
          b.review_count - a.review_count ||
          (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0) ||
          a.display_order - b.display_order
      );
      break;
    case "price-asc":
      sorted.sort((a, b) => Number(a.base_price) - Number(b.base_price));
      break;
    case "price-desc":
      sorted.sort((a, b) => Number(b.base_price) - Number(a.base_price));
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          Number(b.is_new) - Number(a.is_new) ||
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      break;
    default:
      sorted.sort(
        (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)
      );
  }
  return sorted;
}

export const sortLabels: Record<MenuFilters["sort"], string> = {
  recommended: "Recommended",
  popular: "Most loved",
  "price-asc": "Price · low to high",
  "price-desc": "Price · high to low",
  newest: "Newest",
};

export const activeFilterCount = (filters: MenuFilters) =>
  filters.tags.length +
  (filters.price !== "all" ? 1 : 0) +
  (filters.onlyAvailable ? 1 : 0);
