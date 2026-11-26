import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiCheck, FiX } from "react-icons/fi";
import type { MenuFilters, SortKey } from "../../types/menu";
import { activeFilterCount, sortLabels } from "../../services/menu";

export const QUICK_TAGS: { key: string; label: string }[] = [
  { key: "coffee", label: "Coffee" },
  { key: "matcha", label: "Matcha" },
  { key: "hot", label: "Hot" },
  { key: "iced", label: "Iced" },
  { key: "best-seller", label: "Best Seller" },
  { key: "new", label: "New" },
  { key: "seasonal", label: "Seasonal" },
  { key: "signature", label: "Signature" },
];

export const PRICE_OPTIONS: { value: MenuFilters["price"]; label: string }[] = [
  { value: "all", label: "Any price" },
  { value: "under-120", label: "Under ₱120" },
  { value: "120-150", label: "₱120 – ₱150" },
  { value: "over-150", label: "Over ₱150" },
];

export function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-[38px] items-center gap-2 border px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] transition ${
        active
          ? "border-burgundy-800 bg-burgundy-800 text-cream"
          : "border-ink/20 text-ink/70 hover:border-ink/45 hover:text-ink"
      }`}
    >
      {active && <FiCheck size={11} aria-hidden />}
      {children}
    </button>
  );
}

export function InlineFilters({
  filters,
  onChange,
}: {
  filters: MenuFilters;
  onChange: (next: MenuFilters) => void;
}) {
  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {QUICK_TAGS.map((tag) => (
        <FilterChip
          key={tag.key}
          active={filters.tags.includes(tag.key)}
          onClick={() => toggleTag(tag.key)}
        >
          {tag.label}
        </FilterChip>
      ))}
      <label className="ml-1 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink/70">
        <span className="sr-only">Price range</span>
        <select
          value={filters.price}
          onChange={(e) =>
            onChange({ ...filters, price: e.target.value as MenuFilters["price"] })
          }
          className="min-h-[38px] border border-ink/20 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-ink/70 focus:border-burgundy-800 focus:outline-none"
        >
          {PRICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 border border-ink/20 px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] text-ink/70">
        <input
          type="checkbox"
          checked={filters.onlyAvailable}
          onChange={(e) => onChange({ ...filters, onlyAvailable: e.target.checked })}
          className="accent-burgundy-800"
        />
        Available now
      </label>
    </div>
  );
}

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (sort: SortKey) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink/70">
      <span className="hidden sm:inline">Sort</span>
      <span className="sr-only sm:hidden">Sort menu</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="min-h-[38px] border border-ink/20 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-ink/70 focus:border-burgundy-800 focus:outline-none"
      >
        {(Object.keys(sortLabels) as SortKey[]).map((key) => (
          <option key={key} value={key}>
            {sortLabels[key]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterSheet({
  open,
  onClose,
  filters,
  onChange,
  countFor,
  returnFocusTo,
}: {
  open: boolean;
  onClose: () => void;
  filters: MenuFilters;
  onChange: (next: MenuFilters) => void;
  countFor: (filters: MenuFilters) => number;
  returnFocusTo?: React.RefObject<HTMLButtonElement | null>;
}) {
  const [draft, setDraft] = useState(filters);
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      setDraft(filters);
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.setTimeout(() => closeRef.current?.focus(), 40);
      return () => {
        document.body.style.overflow = previous;
        const target = returnFocusTo?.current || triggerRef.current;
        if (target instanceof HTMLElement) target.focus();
      };
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const toggleTag = (tag: string) => {
    setDraft((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((t) => t !== tag)
        : [...current.tags, tag],
    }));
  };

  const reset = () =>
    setDraft({ ...draft, tags: [], price: "all", onlyAvailable: false });

  const count = activeFilterCount(draft);
  const draftCount = countFor(draft);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filter the menu"
            initial={reduce ? { y: 0 } : { y: 40 }}
            animate={{ y: 0 }}
            exit={reduce ? { y: 0 } : { y: 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[85vh] w-full overflow-y-auto border-t border-ink/10 bg-cream px-5 pb-8 pt-4"
          >
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <p className="font-heading text-2xl">Filters</p>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="p-2 text-ink/70 hover:text-ink"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-[0.26em] text-ink/70">Collections</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => (
                  <FilterChip
                    key={tag.key}
                    active={draft.tags.includes(tag.key)}
                    onClick={() => toggleTag(tag.key)}
                  >
                    {tag.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <p className="text-[10px] uppercase tracking-[0.26em] text-ink/70">Price</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {PRICE_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.value}
                    active={draft.price === option.value}
                    onClick={() => setDraft({ ...draft, price: option.value })}
                  >
                    {option.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <label className="flex min-h-[44px] cursor-pointer items-center justify-between border border-ink/15 px-4 py-3 text-sm">
                <span>Available now only</span>
                <input
                  type="checkbox"
                  checked={draft.onlyAvailable}
                  onChange={(e) => setDraft({ ...draft, onlyAvailable: e.target.checked })}
                  className="h-4 w-4 accent-burgundy-800"
                />
              </label>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="min-h-[48px] border border-ink/20 px-5 text-[10px] uppercase tracking-[0.22em] text-ink/65"
              >
                Clear{count ? ` (${count})` : ""}
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(draft);
                  onClose();
                }}
                className="min-h-[48px] flex-1 bg-burgundy-800 px-5 text-[10px] uppercase tracking-[0.22em] text-cream"
              >
                Show {draftCount} drink{draftCount === 1 ? "" : "s"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
