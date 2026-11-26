import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { Badge } from "../ui/Badge";
import type { MenuProduct } from "../../types/menu";
import { availabilityCopy, formatPeso, productImage } from "../../services/menu";

export function ProductBadges({
  product,
  limit,
  onImage = false,
}: {
  product: MenuProduct;
  limit?: number;
  onImage?: boolean;
}) {
  const badges = (product.badges || []).slice(0, limit);
  if (!badges.length) return null;
  if (onImage) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {badges.map((badge) => (
          <span
            key={`${badge.label}-${badge.tone}`}
            className="inline-flex items-center border border-ink/10 bg-cream/90 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-ink/80 backdrop-blur-sm"
          >
            {badge.label}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <Badge key={`${badge.label}-${badge.tone}`} tone={badge.tone as "ink" | "cream" | "matcha" | "sand"}>
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}

export default function ProductCard({
  product,
  variant = "default",
}: {
  product: MenuProduct;
  variant?: "default" | "feature" | "compact";
}) {
  const image = productImage(product);
  const availability = availabilityCopy(product);
  const isFeature = variant === "feature";
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <Link
        to={`/product/${product.id}`}
        className="group flex items-center gap-4 border-b border-ink/10 py-4 transition hover:border-ink/30"
      >
        <div className="h-20 w-16 shrink-0 overflow-hidden bg-ivory">
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-[0.24em] text-burgundy-800/80">
            {product.category_name}
          </p>
          <p className="mt-1 truncate font-heading text-lg leading-tight">{product.name}</p>
          <p className="mt-0.5 text-xs text-ink/65">{formatPeso(product.base_price)}</p>
        </div>
        <FiArrowUpRight
          size={16}
          aria-hidden
          className="shrink-0 text-ink/40 transition group-hover:text-burgundy-800"
        />
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-800 focus-visible:ring-offset-4 focus-visible:ring-offset-cream ${
        isFeature ? "md:grid md:grid-cols-2 md:items-center md:gap-10" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-ivory ${
          isFeature ? "aspect-[4/3] md:aspect-[4/5]" : "aspect-[4/5]"
        }`}
      >
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.045]"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          {product.availability_status === "available" ? (
            <ProductBadges product={product} limit={2} onImage />
          ) : (
            <span className="border border-cream/40 bg-cream/90 px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] text-ink/80">
              {availability.title.replace(/\.$/, "")}
            </span>
          )}
        </div>
        {!availability.orderable && (
          <div className="absolute inset-0 bg-cream/35" aria-hidden />
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-4 bottom-4 flex translate-y-2 items-center justify-between border border-cream/40 bg-cream/90 px-3 py-2 text-[9px] uppercase tracking-[0.24em] text-burgundy-800 opacity-0 backdrop-blur-sm transition duration-500 group-hover:translate-y-0 group-hover:opacity-100"
        >
          View the drink
          <FiArrowUpRight size={13} />
        </span>
      </div>

      <div className={isFeature ? "mt-6 md:mt-0" : "mt-5"}>
        <p className="text-[9px] uppercase tracking-[0.28em] text-burgundy-800/80">
          {product.category_name}
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h3
            className={`font-heading leading-[1.1] ${
              isFeature ? "text-[clamp(1.8rem,3vw,2.6rem)]" : "text-[1.35rem]"
            }`}
          >
            {product.name}
          </h3>
          <span className="whitespace-nowrap pt-1 text-sm text-ink/80">
            {formatPeso(product.base_price)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 max-w-md text-[13px] leading-relaxed text-ink/65">
          {product.description}
        </p>
        {product.flavor_notes && (
          <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-ink/65">
            {product.flavor_notes}
          </p>
        )}
        {product.review_count > 0 && (
          <p
            className="mt-3 text-xs text-ink/65"
            aria-label={`${product.avg_rating} out of 5 from ${product.review_count} reviews`}
          >
            <span className="text-burgundy-800" aria-hidden>
              ★
            </span>{" "}
            {product.avg_rating} · {product.review_count} review
            {product.review_count > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
}
