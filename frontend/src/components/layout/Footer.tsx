import { Link } from "react-router-dom";
import { FiInstagram, FiArrowUpRight } from "react-icons/fi";
import { Container } from "../ui/Container";
import { Wordmark } from "../brand/Wordmark";
import { CircleMotif } from "../brand/CircleMotif";
import { business } from "../../content/site";

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Our Story", to: "/#story" },
      { label: "Menu", to: "/menu" },
      { label: "Find Us", to: "/#find-us" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Visit",
    links: [
      { label: "Rewards", to: "/rewards" },
      { label: "Reservations", to: "/reservations" },
      { label: "Careers", to: "/careers" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-burgundy-950 text-cream">
      <div className="pointer-events-none absolute -right-[22rem] -top-[26rem] text-cream" aria-hidden>
        <CircleMotif className="filo-rings-breathe h-[60rem] w-[60rem]" rings={5} />
      </div>

      <Container size="wide" className="relative">
        <div className="grid gap-14 border-b border-cream/10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-5">
            <Wordmark className="text-[20px]" tone="cream" />
            <p className="mt-6 max-w-xs font-heading text-2xl italic leading-snug text-cream/80">{business.tagline}</p>
            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-cream/60">
              {business.locality} · {business.status}
            </p>
          </div>

          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="md:col-span-2">
              <h2 className="text-[9px] uppercase tracking-[0.3em] text-cream/60">{group.title}</h2>
              <ul className="mt-5 space-y-3 text-sm text-cream/75">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition hover:text-cream">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="md:col-span-3">
            <h2 className="text-[9px] uppercase tracking-[0.3em] text-cream/60">Connect</h2>
            <ul className="mt-5 space-y-3 text-sm text-cream/75">
              <li>
                <a href={business.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-cream">
                  <FiInstagram size={14} /> {business.instagramHandle}
                </a>
              </li>
              <li>
                <a href={business.maps} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-cream">
                  <FiArrowUpRight size={14} /> Google Maps
                </a>
              </li>
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-cream/60">
              Full address and opening hours to be confirmed. Photography is temporary until official
              café images are available.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-7 text-[10px] uppercase tracking-[0.18em] text-cream/60 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Filo Coffee and Matcha</span>
          <div className="flex flex-wrap gap-6">
            <Link to="/privacy" className="transition hover:text-cream/70">Privacy Policy</Link>
            <Link to="/terms" className="transition hover:text-cream/70">Terms</Link>
            <span className="text-cream/60">{business.region}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
