import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiX } from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type Notification = {
  id: number;
  event: string;
  title: string;
  body: string;
  url: string;
  is_read: boolean;
  created_at: string;
};

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}

export function NotificationBell({ tone = "ink", align = "end", alignFrom = "sm" }: { tone?: "ink" | "cream"; align?: "start" | "end"; alignFrom?: "sm" | "md" }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const keyboardOpenRef = useRef(false);

  const loadUnread = useCallback(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    api
      .get("/notifications/unread-count/")
      .then((r) => setUnread(Number(r.data?.count) || 0))
      .catch(() => setUnread(0));
  }, [user]);

  const loadList = useCallback(() => {
    if (!user) return;
    setLoading(true);
    setFailed(false);
    api
      .get("/notifications/")
      .then((r) => setItems(r.data.results ?? r.data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadUnread();
    if (!user) return;
    const timer = window.setInterval(loadUnread, 60000);
    const onChanged = () => loadUnread();
    window.addEventListener("filo:notifications-changed", onChanged);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("filo:notifications-changed", onChanged);
    };
  }, [user, loadUnread]);

  useEffect(() => {
    if (!open) return;
    loadList();
    if (keyboardOpenRef.current) {
      panelRef.current?.focus();
      keyboardOpenRef.current = false;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, loadList]);

  const markRead = async (notification: Notification) => {
    if (!notification.is_read) {
      setItems((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item))
      );
      setUnread((count) => Math.max(0, count - 1));
      api.post(`/notifications/${notification.id}/read/`).catch(() => {});
    }
    setOpen(false);
    if (notification.url) navigate(notification.url);
  };

  const markAll = async () => {
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnread(0);
    api.post("/notifications/read-all/").catch(() => {});
  };

  if (!user) return null;

  const iconTone = tone === "cream" ? "text-cream" : "text-ink";
  const panelText = "text-ink";
  const panelPlacement =
    alignFrom === "md"
      ? `fixed inset-x-4 top-[4.75rem] z-[60] w-auto border border-ink/15 bg-cream shadow-[0_20px_60px_-30px_rgba(41,8,6,0.45)] outline-none md:absolute md:inset-x-auto md:top-[calc(100%+14px)] md:w-[min(22rem,calc(100vw-2rem))] ${
          align === "start" ? "md:left-0" : "md:right-0"
        }`
      : `fixed inset-x-4 top-[4.75rem] z-[60] w-auto border border-ink/15 bg-cream shadow-[0_20px_60px_-30px_rgba(41,8,6,0.45)] outline-none sm:absolute sm:inset-x-auto sm:top-[calc(100%+14px)] sm:w-[min(22rem,calc(100vw-2rem))] ${
          align === "start" ? "sm:left-0" : "sm:right-0"
        }`;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") keyboardOpenRef.current = true;
        }}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-controls="notification-panel"
        className={`relative p-1.5 opacity-80 transition hover:opacity-100 ${iconTone}`}
      >
        <FiBell size={17} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy-800 px-1 text-[9px] font-medium leading-none text-cream ring-2 ring-cream"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notification-panel"
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          tabIndex={-1}
          className={`${panelPlacement} ${panelText}`}
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-ink/65">Notifications</p>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAll}
                  className="flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-ink/65 transition hover:text-burgundy-800"
                >
                  <FiCheck size={12} /> Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label="Close notifications"
                className="p-1 text-ink/65 transition hover:text-ink"
              >
                <FiX size={15} />
              </button>
            </div>
          </div>

          <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
            {loading && (
              <div className="space-y-3 p-4" aria-live="polite">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-2/3 animate-pulse bg-ink/[0.06]" />
                    <div className="h-2.5 w-full animate-pulse bg-ink/[0.04]" />
                  </div>
                ))}
                <span className="sr-only">Loading notifications</span>
              </div>
            )}

            {!loading && failed && (
              <p className="px-4 py-6 text-sm text-ink/65" role="status">
                Could not load notifications. Please try again.
              </p>
            )}

            {!loading && !failed && items.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-ink/65" role="status">
                Nothing new. We will let you know when something happens.
              </p>
            )}

            {!loading &&
              !failed &&
              items.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item)}
                  className={`flex w-full items-start gap-3 border-b border-ink/[0.07] px-4 py-3.5 text-left transition last:border-b-0 hover:bg-ivory/60 ${
                    item.is_read ? "opacity-65" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      item.is_read ? "bg-transparent" : "bg-burgundy-800"
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm leading-snug text-ink">{item.title}</span>
                    {item.body && (
                      <span className="mt-1 block text-xs leading-relaxed text-ink/65">{item.body}</span>
                    )}
                    <span className="mt-1.5 block text-[9px] uppercase tracking-[0.16em] text-ink/65">
                      {timeAgo(item.created_at)}
                    </span>
                  </span>
                </button>
              ))}
          </div>

          <div className="border-t border-ink/10 px-4 py-3">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-[10px] uppercase tracking-[0.2em] text-burgundy-800 underline underline-offset-4"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
