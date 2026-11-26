import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Container, Section } from "../../components/ui/Container";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { EmptyState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../components/ui/Toast";

type Notification = {
  id: number;
  event: string;
  title: string;
  body: string;
  url: string;
  is_read: boolean;
  created_at: string;
};

type Preferences = {
  in_app_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  marketing_opt_in: boolean;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Notification[]>([]);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const load = () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFailed(false);
    Promise.all([
      api.get("/notifications/").then((r) => r.data.results ?? r.data),
      api.get("/notifications/preferences/").then((r) => r.data),
    ])
      .then(([list, preferences]) => {
        setItems(list);
        setPrefs(preferences);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user]);

  const markRead = async (notification: Notification) => {
    if (notification.is_read) return;
    try {
      await api.post(`/notifications/${notification.id}/read/`);
      setItems((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item))
      );
      window.dispatchEvent(new Event("filo:notifications-changed"));
    } catch {
      toast("Could not update the notification.", "error");
    }
  };

  const markAll = async () => {
    try {
      await api.post("/notifications/read-all/");
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
      window.dispatchEvent(new Event("filo:notifications-changed"));
      toast("All notifications marked as read.");
    } catch {
      toast("Could not mark notifications as read.", "error");
    }
  };

  const savePreferences = async (next: Preferences) => {
    setPrefs(next);
    try {
      await api.patch("/notifications/preferences/", next);
      toast("Notification preferences saved.");
    } catch {
      toast("Could not save notification preferences.", "error");
      load();
    }
  };

  const visible = onlyUnread ? items.filter((item) => !item.is_read) : items;
  const unread = items.filter((item) => !item.is_read).length;

  if (!user) {
    return (
      <div className="bg-cream">
        <Section>
          <Container>
            <SectionHeading
              level={1}
              eyebrow="Notifications"
              title="Nothing to show yet."
              copy="Sign in to see updates about your orders and reservations."
            />
            <div className="mt-8">
              <Link to="/login" className="text-[11px] uppercase tracking-[0.22em] text-burgundy-800 underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </Container>
        </Section>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <Section>
        <Container>
          <SectionHeading
            level={1}
            eyebrow="Notifications"
            title="Small updates, in one place."
            copy="Order progress, payment checks, and reservation confirmations. In-app notifications are always available; email and SMS are off until configured."
          />

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            <section aria-labelledby="notification-list-heading">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-4">
                <div>
                  <h2 id="notification-list-heading" className="font-heading text-3xl">
                    Your updates
                  </h2>
                  <p className="mt-2 text-xs text-ink/65" role="status">
                    {unread === 0 ? "You are all caught up." : `${unread} unread notification${unread === 1 ? "" : "s"}.`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-ink/65">
                    <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />
                    Unread only
                  </label>
                  {unread > 0 && (
                    <button
                      type="button"
                      onClick={markAll}
                      className="text-[10px] uppercase tracking-[0.18em] text-burgundy-800 underline underline-offset-4"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {loading && (
                <div className="mt-6 space-y-4" aria-live="polite">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="border border-ink/10 p-5">
                      <Skeleton className="h-3.5 w-1/2" />
                      <Skeleton className="mt-3 h-3 w-5/6" />
                      <Skeleton className="mt-2 h-3 w-2/3" />
                    </div>
                  ))}
                  <span className="sr-only">Loading notifications</span>
                </div>
              )}

              {!loading && failed && (
                <div className="mt-6 border border-ink/10 p-6">
                  <p className="text-sm text-ink/70">Could not load notifications.</p>
                  <button
                    type="button"
                    onClick={load}
                    className="mt-3 text-[10px] uppercase tracking-[0.2em] text-burgundy-800 underline underline-offset-4"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading && !failed && visible.length === 0 && (
                <div className="mt-6">
                  <EmptyState
                    title={onlyUnread ? "No unread notifications." : "Nothing here yet."}
                    copy={
                      onlyUnread
                        ? "You are all caught up."
                        : "When you place an order or request a table, updates will appear here."
                    }
                  />
                </div>
              )}

              {!loading && !failed && visible.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {visible.map((item) => (
                    <li key={item.id} className={`border p-5 ${item.is_read ? "border-ink/10" : "border-burgundy-800/35 bg-ivory/40"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span
                            aria-hidden
                            className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${item.is_read ? "bg-ink/15" : "bg-burgundy-800"}`}
                          />
                          <div>
                            <p className="text-sm font-medium text-ink">{item.title}</p>
                            {item.body && <p className="mt-1 text-sm leading-relaxed text-ink/65">{item.body}</p>}
                            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-ink/65">{formatDate(item.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {!item.is_read && (
                            <button
                              type="button"
                              onClick={() => markRead(item)}
                              className="text-[10px] uppercase tracking-[0.16em] text-ink/65 hover:text-burgundy-800"
                            >
                              Mark read
                            </button>
                          )}
                          {item.url && (
                            <Link
                              to={item.url}
                              onClick={() => markRead(item)}
                              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-burgundy-800"
                            >
                              Open <FiArrowRight size={12} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="h-fit border border-ink/10 p-6" aria-labelledby="notification-prefs-heading">
              <h2 id="notification-prefs-heading" className="font-heading text-2xl">
                Preferences
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-ink/65">
                In-app updates are part of your account. Email and SMS remain off until the café configures a provider.
              </p>
              {loading && <Skeleton className="mt-6 h-28" />}
              {!loading && prefs && (
                <div className="mt-5 space-y-4">
                  <label className="flex items-start justify-between gap-3 text-sm">
                    <span>
                      In-app notifications
                      <span className="mt-1 block text-xs text-ink/65">Order and reservation updates inside Filo.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={prefs.in_app_enabled}
                      onChange={(e) => savePreferences({ ...prefs, in_app_enabled: e.target.checked })}
                      className="mt-1"
                    />
                  </label>
                  <label className="flex items-start justify-between gap-3 text-sm text-ink/65">
                    <span>
                      Email notifications
                      <span className="mt-1 block text-xs text-ink/65">Available when email delivery is configured.</span>
                    </span>
                    <input type="checkbox" checked={false} disabled readOnly />
                  </label>
                  <label className="flex items-start justify-between gap-3 text-sm text-ink/65">
                    <span>
                      SMS notifications
                      <span className="mt-1 block text-xs text-ink/65">Requires an SMS provider.</span>
                    </span>
                    <input type="checkbox" checked={false} disabled readOnly />
                  </label>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
