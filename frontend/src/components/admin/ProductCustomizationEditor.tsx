import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import { Skeleton } from "../ui/States";
import { useToast } from "../ui/Toast";

const field =
  "w-full border border-ink/20 bg-transparent p-2 text-sm focus:border-filo-red focus:outline-none";
const labelClass = "text-[10px] uppercase tracking-[0.18em] text-ink/65";
const smallButton =
  "border border-ink/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ink/70 transition hover:border-ink/50";

const KINDS = [
  ["temperature", "Temperature"],
  ["milk", "Milk"],
  ["sweetness", "Sweetness"],
  ["other", "Other"],
] as const;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type Product = { id: number; name: string };

export default function ProductCustomizationEditor({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingGroup, setAddingGroup] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get(`/menu/customization-groups/?product=${product.id}`),
      api.get(`/menu/sizes/?product=${product.id}`),
      api.get(`/menu/product-addons/?product=${product.id}`),
      api.get("/menu/addons/"),
    ])
      .then(([groupRes, sizeRes, linkRes, addonRes]) => {
        setGroups(groupRes.data.results ?? groupRes.data);
        setSizes(sizeRes.data.results ?? sizeRes.data);
        setLinks(linkRes.data.results ?? linkRes.data);
        setAddons(addonRes.data.results ?? addonRes.data);
      })
      .catch(() => toast("Could not load customization settings.", "error"))
      .finally(() => setLoading(false));
  }, [product.id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const saveGroup = async (id: number, payload: any) => {
    try {
      await api.patch(`/menu/customization-groups/${id}/`, payload);
      toast("Group updated.");
      load();
    } catch {
      toast("Could not update the group.", "error");
    }
  };

  const removeGroup = async (group: any) => {
    if (!window.confirm(`Delete “${group.label}” and all of its options?`)) return;
    try {
      await api.delete(`/menu/customization-groups/${group.id}/`);
      toast("Group deleted.");
      load();
    } catch {
      toast("Could not delete the group.", "error");
    }
  };

  const addGroup = async (payload: any) => {
    try {
      await api.post("/menu/customization-groups/", { ...payload, product: product.id });
      toast("Group added.");
      setAddingGroup(false);
      load();
    } catch {
      toast("Could not add the group. Check the key is unique.", "error");
    }
  };

  const saveOption = async (id: number, payload: any) => {
    try {
      await api.patch(`/menu/customization-options/${id}/`, payload);
      toast("Option updated.");
      load();
    } catch {
      toast("Could not update the option.", "error");
    }
  };

  const removeOption = async (option: any) => {
    if (!window.confirm(`Delete the option “${option.label}”?`)) return;
    try {
      await api.delete(`/menu/customization-options/${option.id}/`);
      toast("Option deleted.");
      load();
    } catch {
      toast("Could not delete the option.", "error");
    }
  };

  const addOption = async (groupId: number, payload: any) => {
    try {
      await api.post("/menu/customization-options/", { ...payload, group: groupId });
      toast("Option added.");
      load();
    } catch {
      toast("Could not add the option. Check the key is unique.", "error");
    }
  };

  const saveSize = async (id: number, payload: any) => {
    try {
      await api.patch(`/menu/sizes/${id}/`, payload);
      toast("Size updated.");
      load();
    } catch {
      toast("Could not update the size.", "error");
    }
  };

  const removeSize = async (size: any) => {
    if (!window.confirm(`Remove the size “${size.name}”?`)) return;
    try {
      await api.delete(`/menu/sizes/${size.id}/`);
      toast("Size removed.");
      load();
    } catch {
      toast("Could not remove the size.", "error");
    }
  };

  const addSize = async (payload: any) => {
    try {
      await api.post("/menu/sizes/", { ...payload, product: product.id });
      toast("Size added.");
      load();
    } catch {
      toast("Could not add the size.", "error");
    }
  };

  const linkAddon = async (addonId: number) => {
    try {
      await api.post("/menu/product-addons/", { product: product.id, addon: addonId });
      toast("Add-on linked.");
      load();
    } catch {
      toast("Could not link the add-on.", "error");
    }
  };

  const unlinkAddon = async (link: any) => {
    try {
      await api.delete(`/menu/product-addons/${link.id}/`);
      toast("Add-on unlinked.");
      load();
    } catch {
      toast("Could not unlink the add-on.", "error");
    }
  };

  const linkedIds = new Set(links.map((link) => link.addon));
  const availableAddons = addons.filter((addon) => !linkedIds.has(addon.id));

  return (
    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto bg-filo-cream p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">Customization</h2>
          <p className="mt-1 text-sm text-ink/65">{product.name}</p>
        </div>
        <button type="button" onClick={onClose} className={smallButton}>
          Close
        </button>
      </div>

      <p className="mt-4 border border-ink/10 bg-ivory/50 p-3 text-xs leading-relaxed text-ink/70">
        Sizes and linked add-ons automatically become storefront option groups. Use option
        groups below for temperature, milk, sweetness, and anything else this drink needs.
      </p>

      {loading ? (
        <div className="mt-6 space-y-3" aria-live="polite">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
          <span className="sr-only">Loading customization</span>
        </div>
      ) : (
        <>
          <section className="mt-8">
            <h3 className="font-heading text-xl">Sizes</h3>
            <div className="mt-3 space-y-2">
              {sizes.map((size) => (
                <SizeRow
                  key={size.id}
                  size={size}
                  onSave={(payload) => saveSize(size.id, payload)}
                  onRemove={() => removeSize(size)}
                />
              ))}
              {sizes.length === 0 && (
                <p className="text-sm text-ink/60">No sizes yet. Add the first one below.</p>
              )}
            </div>
            <AddSize onAdd={addSize} />
          </section>

          <section className="mt-8">
            <h3 className="font-heading text-xl">Add-ons</h3>
            <div className="mt-3 space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-wrap items-center justify-between gap-2 border border-ink/10 p-3 text-sm"
                >
                  <span>
                    {link.addon_detail?.name || `Add-on #${link.addon}`}
                    <span className="ml-2 text-xs text-ink/55">
                      ₱{link.addon_detail?.price ?? "—"}
                    </span>
                  </span>
                  <button type="button" onClick={() => unlinkAddon(link)} className={smallButton}>
                    Remove
                  </button>
                </div>
              ))}
              {links.length === 0 && (
                <p className="text-sm text-ink/60">No add-ons linked to this product.</p>
              )}
            </div>
            {availableAddons.length > 0 && (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <label className="flex-1">
                  <span className={labelClass}>Link an existing add-on</span>
                  <select
                    id="link-addon"
                    className={`${field} mt-1`}
                    defaultValue=""
                    onChange={(event) => {
                      if (event.target.value) {
                        linkAddon(Number(event.target.value));
                        event.target.value = "";
                      }
                    }}
                  >
                    <option value="">Choose an add-on…</option>
                    {availableAddons.map((addon) => (
                      <option key={addon.id} value={addon.id}>
                        {addon.name} · ₱{addon.price}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </section>

          <section className="mt-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-heading text-xl">Option groups</h3>
              <button type="button" onClick={() => setAddingGroup(true)} className={smallButton}>
                Add group
              </button>
            </div>

            {addingGroup && (
              <GroupForm
                className="mt-4 border border-filo-red/30 p-4"
                submitLabel="Add group"
                onCancel={() => setAddingGroup(false)}
                onSubmit={(payload) => addGroup(payload)}
              />
            )}

            <div className="mt-4 space-y-4">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onSave={(payload) => saveGroup(group.id, payload)}
                  onRemove={() => removeGroup(group)}
                  onSaveOption={saveOption}
                  onRemoveOption={removeOption}
                  onAddOption={(payload) => addOption(group.id, payload)}
                />
              ))}
              {groups.length === 0 && !addingGroup && (
                <p className="text-sm text-ink/60">
                  No option groups yet. Add temperature, milk, or sweetness to make ordering
                  configurable.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SizeRow({
  size,
  onSave,
  onRemove,
}: {
  size: any;
  onSave: (payload: any) => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(size.name);
  const [adjustment, setAdjustment] = useState(size.price_adjustment);
  const [active, setActive] = useState(size.is_active);

  return (
    <div className="flex flex-wrap items-end gap-2 border border-ink/10 p-3">
      <label className="min-w-32 flex-1">
        <span className={labelClass}>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-1`} />
      </label>
      <label className="w-28">
        <span className={labelClass}>Adjustment</span>
        <input
          type="number"
          step="0.01"
          value={adjustment}
          onChange={(e) => setAdjustment(e.target.value)}
          className={`${field} mt-1`}
        />
      </label>
      <label className="flex min-h-9 items-center gap-2 text-xs text-ink/70">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Active
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            onSave({ name, price_adjustment: adjustment, is_active: active })
          }
          className={smallButton}
        >
          Save
        </button>
        <button type="button" onClick={onRemove} className={smallButton}>
          Remove
        </button>
      </div>
    </div>
  );
}

function AddSize({ onAdd }: { onAdd: (payload: any) => void }) {
  const [name, setName] = useState("");
  const [adjustment, setAdjustment] = useState("0");

  return (
    <div className="mt-3 flex flex-wrap items-end gap-2">
      <label className="min-w-32 flex-1">
        <span className={labelClass}>New size name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-1`} />
      </label>
      <label className="w-28">
        <span className={labelClass}>Adjustment</span>
        <input
          type="number"
          step="0.01"
          value={adjustment}
          onChange={(e) => setAdjustment(e.target.value)}
          className={`${field} mt-1`}
        />
      </label>
      <button
        type="button"
        onClick={() => {
          if (!name.trim()) return;
          onAdd({ name: name.trim(), price_adjustment: adjustment, is_active: true });
          setName("");
          setAdjustment("0");
        }}
        className={smallButton}
      >
        Add size
      </button>
    </div>
  );
}

function GroupForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  className = "",
}: {
  initial?: any;
  onSubmit: (payload: any) => void;
  onCancel?: () => void;
  submitLabel: string;
  className?: string;
}) {
  const [label, setLabel] = useState(initial?.label || "");
  const [key, setKey] = useState(initial?.key || "");
  const [kind, setKind] = useState(initial?.kind || "other");
  const [selectionType, setSelectionType] = useState(initial?.selection_type || "single");
  const [required, setRequired] = useState(!!initial?.is_required);
  const [helpText, setHelpText] = useState(initial?.help_text || "");
  const [displayOrder, setDisplayOrder] = useState(initial?.display_order ?? 0);
  const [active, setActive] = useState(initial?.is_active ?? true);

  return (
    <div className={className}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Label</span>
          <input
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (!initial) setKey(slugify(e.target.value));
            }}
            className={`${field} mt-1`}
          />
        </label>
        <label>
          <span className={labelClass}>Key</span>
          <input value={key} onChange={(e) => setKey(e.target.value)} className={`${field} mt-1`} />
        </label>
        <label>
          <span className={labelClass}>Kind</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={`${field} mt-1`}>
            {KINDS.map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClass}>Selection</span>
          <select
            value={selectionType}
            onChange={(e) => setSelectionType(e.target.value)}
            className={`${field} mt-1`}
          >
            <option value="single">Single choice</option>
            <option value="multiple">Multiple choice</option>
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>Help text · optional</span>
          <input
            value={helpText}
            onChange={(e) => setHelpText(e.target.value)}
            className={`${field} mt-1`}
          />
        </label>
        <label>
          <span className={labelClass}>Display order</span>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className={`${field} mt-1`}
          />
        </label>
        <div className="flex flex-wrap items-center gap-4 pt-4 text-xs text-ink/70">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            Required
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            onSubmit({
              label,
              key: key || slugify(label),
              kind,
              selection_type: selectionType,
              is_required: required,
              help_text: helpText,
              display_order: Number(displayOrder) || 0,
              is_active: active,
            })
          }
          className={smallButton}
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={smallButton}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function GroupCard({
  group,
  onSave,
  onRemove,
  onSaveOption,
  onRemoveOption,
  onAddOption,
}: {
  group: any;
  onSave: (payload: any) => void;
  onRemove: () => void;
  onSaveOption: (id: number, payload: any) => void;
  onRemoveOption: (option: any) => void;
  onAddOption: (payload: any) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border border-ink/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-heading text-lg">{group.label}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-ink/60">
            {group.kind} · {group.selection_type} {group.is_required ? "· required" : ""}{" "}
            {group.is_active ? "" : "· inactive"}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing((value) => !value)} className={smallButton}>
            {editing ? "Hide settings" : "Settings"}
          </button>
          <button type="button" onClick={onRemove} className={smallButton}>
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <GroupForm
          initial={group}
          submitLabel="Save group"
          onCancel={() => setEditing(false)}
          onSubmit={(payload) => {
            onSave(payload);
            setEditing(false);
          }}
          className="mt-4 border border-ink/10 bg-ivory/40 p-3"
        />
      )}

      <div className="mt-4 space-y-2">
        {(group.options || []).map((option: any) => (
          <OptionRow
            key={option.id}
            option={option}
            onSave={(payload) => onSaveOption(option.id, payload)}
            onRemove={() => onRemoveOption(option)}
          />
        ))}
        {(group.options || []).length === 0 && (
          <p className="text-sm text-ink/60">No options in this group yet.</p>
        )}
      </div>

      <AddOption onAdd={onAddOption} />
    </div>
  );
}

function OptionRow({
  option,
  onSave,
  onRemove,
}: {
  option: any;
  onSave: (payload: any) => void;
  onRemove: () => void;
}) {
  const [label, setLabel] = useState(option.label);
  const [description, setDescription] = useState(option.description || "");
  const [price, setPrice] = useState(option.price_adjustment);
  const [isDefault, setIsDefault] = useState(option.is_default);
  const [active, setActive] = useState(option.is_active);
  const [availability, setAvailability] = useState(option.availability_status || "available");

  return (
    <div className="grid gap-2 border border-ink/10 p-3 sm:grid-cols-2">
      <label>
        <span className={labelClass}>Label</span>
        <input value={label} onChange={(e) => setLabel(e.target.value)} className={`${field} mt-1`} />
      </label>
      <label>
        <span className={labelClass}>Price adjustment</span>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={`${field} mt-1`}
        />
      </label>
      <label className="sm:col-span-2">
        <span className={labelClass}>Description · optional</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${field} mt-1`}
        />
      </label>
      <label>
        <span className={labelClass}>Availability</span>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className={`${field} mt-1`}
        >
          <option value="available">Available</option>
          <option value="sold_out">Sold out</option>
          <option value="unavailable">Unavailable</option>
          <option value="hidden">Hidden</option>
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-4 text-xs text-ink/70 sm:pt-5">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          Default
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active
        </label>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="button"
          onClick={() =>
            onSave({
              label,
              description,
              price_adjustment: price,
              is_default: isDefault,
              is_active: active,
              availability_status: availability,
            })
          }
          className={smallButton}
        >
          Save option
        </button>
        <button type="button" onClick={onRemove} className={smallButton}>
          Remove
        </button>
      </div>
    </div>
  );
}

function AddOption({ onAdd }: { onAdd: (payload: any) => void }) {
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("0");

  return (
    <div className="mt-3 flex flex-wrap items-end gap-2">
      <label className="min-w-32 flex-1">
        <span className={labelClass}>New option label</span>
        <input value={label} onChange={(e) => setLabel(e.target.value)} className={`${field} mt-1`} />
      </label>
      <label className="w-24">
        <span className={labelClass}>Price</span>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={`${field} mt-1`}
        />
      </label>
      <button
        type="button"
        onClick={() => {
          if (!label.trim()) return;
          onAdd({
            label: label.trim(),
            key: slugify(label),
            price_adjustment: price,
            is_active: true,
            availability_status: "available",
          });
          setLabel("");
          setPrice("0");
        }}
        className={smallButton}
      >
        Add option
      </button>
    </div>
  );
}
