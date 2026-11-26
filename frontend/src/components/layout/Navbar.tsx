import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiMenu, FiX, FiUser, FiInstagram } from "react-icons/fi";
import { Wordmark } from "../brand/Wordmark";
import { CircleMotif } from "../brand/CircleMotif";
import { useAuth } from "../../context/AuthContext";
import { NotificationBell } from "../notifications/NotificationBell";
import { business, navLinks, ORDERING_ENABLED } from "../../content/site";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  const overHero = location.pathname === "/" && !scrolled;
  const solid = scrolled || location.pathname !== "/";
  const tone = overHero ? "text-cream" : "text-ink";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid ? "border-b border-ink/10 bg-cream/95 backdrop-blur-md" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className={`mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-10 ${tone}`}>
          <Link to="/" aria-label="Filo Coffee and Matcha — home" className="group flex items-center">
            <Wordmark className="text-[17px]" tone={overHero ? "cream" : "ink"} />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => {
              const isActive =
                link.to === location.pathname ||
                (link.to.includes("#") && location.pathname === "/" && location.hash === link.to.slice(1));
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="group relative py-2 text-[10px] uppercase tracking-[0.28em] opacity-80 transition hover:opacity-100"
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 bottom-0 h-px origin-left bg-current transition-transform duration-500 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            {user && <NotificationBell tone={overHero ? "cream" : "ink"} />}
            <Link
              to={user ? "/account" : "/login"}
              aria-label={user ? "Account" : "Sign in"}
              className="hidden opacity-70 transition hover:opacity-100 sm:block"
            >
              <FiUser size={17} />
            </Link>

            {ORDERING_ENABLED ? (
              <Link
                to="/menu"
                className={`hidden border px-5 py-2.5 text-[10px] uppercase tracking-[0.24em] transition md:inline-block ${
                  overHero
                    ? "border-cream/35 text-cream hover:bg-cream hover:text-burgundy-800"
                    : "border-burgundy-800 text-burgundy-800 hover:bg-burgundy-800 hover:text-cream"
                }`}
              >
                Order
              </Link>
            ) : (
              <span
                className={`hidden items-center gap-2 text-[9px] uppercase tracking-[0.24em] md:inline-flex ${
                  overHero ? "text-cream/60" : "text-ink/65"
                }`}
              >
                <span className={`h-1 w-1 rounded-full ${overHero ? "bg-sand" : "bg-burgundy-800"}`} aria-hidden />
                Opening Soon
              </span>
            )}

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className="p-2 md:hidden"
            >
              <FiMenu size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-burgundy-900 text-cream md:hidden"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              <CircleMotif className="absolute left-1/2 top-[42%] h-[150vw] w-[150vw] -translate-x-1/2 -translate-y-1/2 text-cream" rings={6} />
            </div>

            <div className="relative flex items-center justify-between px-5 py-4">
              <Wordmark className="text-[16px]" tone="cream" />
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
                <FiX size={24} />
              </button>
            </div>

            <nav aria-label="Mobile" className="relative mt-10 flex flex-col gap-1 px-7">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="block border-b border-cream/10 py-5 font-heading text-[clamp(2.2rem,9vw,3rem)] leading-none tracking-tight"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                to={user ? "/account" : "/login"}
                onClick={() => setOpen(false)}
                className="mt-6 self-start text-[10px] uppercase tracking-[0.28em] text-cream/60"
              >
                {user ? "My Account" : "Sign In"}
              </Link>
              {user && (
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="mt-4 self-start text-[10px] uppercase tracking-[0.28em] text-cream/60"
                >
                  Notifications
                </Link>
              )}
            </nav>

            <div className="relative mt-auto px-7 pb-10 pt-12">
              <p className="text-[9px] uppercase tracking-[0.3em] text-cream/60">{business.locality}</p>
              <p className="mt-2 font-heading text-xl italic text-cream/70">{business.status}</p>
              <div className="mt-6 flex gap-5 text-cream/65">
                <a href={business.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-cream">
                  <FiInstagram size={18} />
                </a>
                <span className="text-[10px] uppercase tracking-[0.24em]">{business.instagramHandle}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
