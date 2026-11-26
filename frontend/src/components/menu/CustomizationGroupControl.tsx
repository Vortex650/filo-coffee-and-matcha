import { FiCheck } from "react-icons/fi";
import type { CustomizationGroup } from "../../types/menu";
import { formatPeso } from "../../services/menu";

export default function CustomizationGroupControl({
  group,
  selected,
  onChange,
  idPrefix,
}: {
  group: CustomizationGroup;
  selected: string[];
  onChange: (next: string[]) => void;
  idPrefix: string;
}) {
  const isMultiple = group.selection_type === "multiple";
  const name = `${idPrefix}-${group.key}`;

  const toggle = (key: string) => {
    if (isMultiple) {
      onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
      return;
    }
    onChange([key]);
  };

  return (
    <fieldset className="border-t border-ink/10 pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <legend className="font-heading text-xl leading-none">{group.label}</legend>
        <span className="text-[9px] uppercase tracking-[0.22em] text-ink/70">
          {group.required ? "Required" : isMultiple ? "Optional · choose any" : "Optional"}
        </span>
      </div>
      {group.help_text && <p className="mt-2 text-xs leading-relaxed text-ink/70">{group.help_text}</p>}

      <div
        className={`mt-4 grid gap-2.5 ${
          group.options.length >= 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
        }`}
      >
        {group.options.map((option) => {
          const isSelected = selected.includes(option.key);
          const adjustment = Number(option.price_adjustment || 0);
          return (
            <label
              key={option.key}
              className={`relative flex min-h-[48px] cursor-pointer items-center justify-between gap-3 border px-4 py-3 text-sm transition duration-200 ${
                option.available
                  ? "border-ink/15 hover:border-ink/40"
                  : "cursor-not-allowed border-ink/10 opacity-45"
              } ${isSelected ? "border-burgundy-800 bg-burgundy-800 text-cream" : "bg-transparent text-ink"}`}
            >
              <input
                type={isMultiple ? "checkbox" : "radio"}
                name={name}
                value={option.key}
                checked={isSelected}
                disabled={!option.available}
                onChange={() => toggle(option.key)}
                className="peer sr-only"
              />
              <span className="pointer-events-none flex min-w-0 flex-col">
                <span className="flex items-center gap-2">
                  <span className="truncate">{option.label}</span>
                  {isSelected && <FiCheck size={13} aria-hidden className="shrink-0" />}
                </span>
                {option.description && (
                  <span
                    className={`mt-0.5 text-[11px] leading-snug ${
                      isSelected ? "text-cream/65" : "text-ink/70"
                    }`}
                  >
                    {option.description}
                  </span>
                )}
              </span>
              {adjustment > 0 && (
                <span
                  className={`pointer-events-none shrink-0 text-[11px] tabular-nums ${
                    isSelected ? "text-cream/80" : "text-ink/60"
                  }`}
                >
                  +{formatPeso(adjustment)}
                </span>
              )}
              {!option.available && (
                <span className="absolute right-2 top-1 text-[8px] uppercase tracking-[0.16em] text-ink/70">
                  Unavailable
                </span>
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 peer-focus-visible:ring-2 peer-focus-visible:ring-burgundy-800 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-cream"
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
