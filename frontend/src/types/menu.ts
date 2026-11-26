export type MenuCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
};

export type OptionSelection = {
  id: number | null;
  key: string;
  label: string;
  description?: string;
  price_adjustment: string;
  is_default: boolean;
  available: boolean;
  size_id?: number;
  addon_id?: number;
};

export type CustomizationGroup = {
  key: string;
  label: string;
  help_text?: string;
  kind: "temperature" | "size" | "milk" | "sweetness" | "addon" | "other";
  selection_type: "single" | "multiple";
  required: boolean;
  min_select: number;
  max_select: number | null;
  display_order: number;
  options: OptionSelection[];
};

export type ProductBadge = { label: string; tone: "ink" | "cream" | "matcha" | "sand" | string };

export type MenuProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  story?: string;
  ingredients?: string;
  allergens?: string;
  flavor_notes?: string;
  tags?: string[];
  base_price: string;
  image_url: string;
  is_available: boolean;
  availability_status:
    | "available"
    | "sold_out"
    | "unavailable"
    | "seasonal"
    | "hidden";
  availability_note?: string;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  is_seasonal: boolean;
  is_signature: boolean;
  is_placeholder: boolean;
  is_stamp_eligible: boolean;
  display_order: number;
  category: number;
  category_name?: string;
  category_slug?: string;
  avg_rating: number | null;
  review_count: number;
  badges: ProductBadge[];
  customization_groups: CustomizationGroup[];
  is_orderable: boolean;
  created_at?: string;
};

export type PriceLine = { label: string; amount: string };

export type PricePreview = {
  unit_price: string;
  quantity: number;
  line_total: string;
  breakdown: PriceLine[];
  selected_option_ids: number[];
  selected_addon_ids: number[];
};

export type SortKey = "recommended" | "popular" | "price-asc" | "price-desc" | "newest";

export type AvailabilityFilter = "all" | "available";

export type MenuFilters = {
  category: number | "all";
  tags: string[];
  sort: SortKey;
  price: "all" | "under-120" | "120-150" | "over-150";
  onlyAvailable: boolean;
};
