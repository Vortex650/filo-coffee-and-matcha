import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Section } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Badge } from "../ui/Badge";
import { Skeleton } from "../ui/States";
import { Reveal } from "../ui/Reveal";
import { api } from "../../services/api";
import { images } from "../../content/site";

type Product = {
  id: number;
  name: string;
  description: string;
  base_price: string;
  image_url?: string;
  is_best_seller?: boolean;
  is_available?: boolean;
  avg_rating?: number | null;
  review_count?: number;
};

function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <img
      src={product.image_url || images.menuFallback.src}
      alt={product.image_url ? product.name : `Placeholder: ${product.name}`}
      loading="lazy"
      className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] ${className}`}
    />
  );
}

export default function SignatureMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/menu/products/?is_featured=true")
      .then((r) => {
        const data: Product[] = r.data.results ?? r.data;
        setProducts(data.filter((p) => p.is_available !== false).slice(0, 3));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const [lead, ...rest] = products;

  return (
    <Section id="menu-preview" className="border-t border-ink/10 bg-ivory/50">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Signature Menu"
            title={
              <>
                Something worth
                <br />
                <span className="italic">savoring.</span>
              </>
            }
          />
          <Reveal delay={0.1}>
            <Link
              to="/menu"
              className="group inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-[10px] uppercase tracking-[0.26em] text-ink/70 transition hover:border-burgundy-800 hover:text-burgundy-800"
            >
              View the full menu
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        {loading ? (
          <div className="mt-14 grid gap-8 md:grid-cols-12">
            <Skeleton className="aspect-[4/5] md:col-span-6" />
            <div className="grid gap-8 md:col-span-5 md:col-start-8">
              <Skeleton className="aspect-[4/3]" />
              <Skeleton className="aspect-[4/3]" />
            </div>
          </div>
        ) : lead ? (
          <div className="mt-14 grid gap-10 md:grid-cols-12 md:gap-8">
            <Reveal className="md:col-span-6">
              <Link to={`/product/${lead.id}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                  <ProductImage product={lead} />
                  {lead.is_best_seller && (
                    <span className="absolute right-4 top-4">
                      <Badge>Best Seller</Badge>
                    </span>
                  )}
                </div>
                <div className="mt-6 flex items-start justify-between gap-6">
                  <div>
                    <h3 className="font-heading text-[clamp(1.7rem,3vw,2.3rem)] leading-tight">{lead.name}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/65">{lead.description}</p>
                    {lead.review_count ? (
                      <p className="mt-3 text-xs text-ink/65">
                        <span className="text-burgundy-800" aria-hidden>
                          ★
                        </span>{" "}
                        {lead.avg_rating} · {lead.review_count} review{lead.review_count > 1 ? "s" : ""}
                      </p>
                    ) : null}
                  </div>
                  <span className="whitespace-nowrap font-heading text-lg">₱{lead.base_price}</span>
                </div>
              </Link>
            </Reveal>

            <div className="grid gap-10 md:col-span-5 md:col-start-8 md:gap-12">
              {(rest.length ? rest : []).map((p, i) => (
                <Reveal key={p.id} delay={0.1 + i * 0.08}>
                  <Link to={`/product/${p.id}`} className="group grid grid-cols-5 items-center gap-5">
                    <div className="relative col-span-3 aspect-square overflow-hidden bg-ivory">
                      <ProductImage product={p} />
                    </div>
                    <div className="col-span-2">
                      {p.is_best_seller && <Badge>Best Seller</Badge>}
                      <h3 className="mt-3 font-heading text-xl leading-tight">{p.name}</h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink/65">{p.description}</p>
                      <p className="mt-2 text-sm">₱{p.base_price}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}

              {rest.length === 0 && (
                <Reveal className="border-l border-ink/10 pl-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-ink/65">Coming soon</p>
                  <p className="mt-4 font-heading text-2xl leading-snug text-ink/75">
                    Signature coffee, matcha, and seasonal drinks.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">
                    Our full menu is being finalised. Follow along for the first look.
                  </p>
                </Reveal>
              )}
            </div>
          </div>
        ) : (
          <Reveal className="mt-14 border border-ink/10 px-8 py-14 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink/65">The menu is being finalised</p>
            <p className="mx-auto mt-5 max-w-md font-heading text-[clamp(1.8rem,4vw,2.6rem)] leading-tight">
              Signature coffee, matcha, and seasonal drinks.
            </p>
            <Link
              to="/menu"
              className="mt-8 inline-flex items-center gap-3 border border-ink/25 px-7 py-3.5 text-[10px] uppercase tracking-[0.26em] text-ink/70 transition hover:border-burgundy-800 hover:text-burgundy-800"
            >
              Browse the menu
            </Link>
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
