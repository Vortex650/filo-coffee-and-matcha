import { Link, NavLink, Outlet } from "react-router-dom";
import { FiGrid, FiShoppingBag, FiCoffee, FiUsers, FiAward, FiBarChart2, FiCalendar, FiSettings, FiBox, FiMessageSquare } from "react-icons/fi";
import { NotificationBell } from "../components/notifications/NotificationBell";

const items = [
  { to: "/admin", label: "Overview", icon: FiGrid, end: true },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { to: "/admin/menu", label: "Menu", icon: FiCoffee },
  { to: "/admin/customers", label: "Customers", icon: FiUsers },
  { to: "/admin/loyalty", label: "Loyalty", icon: FiAward },
  { to: "/admin/reports", label: "Reports", icon: FiBarChart2 },
  { to: "/admin/inventory", label: "Inventory", icon: FiBox },
  { to: "/admin/reviews", label: "Reviews", icon: FiMessageSquare },
  { to: "/admin/reservations", label: "Reservations", icon: FiCalendar },
  { to: "/admin/settings", label: "Settings", icon: FiSettings },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-filo-cream md:flex">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-cream focus:px-4 focus:py-3 focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-ink"
      >
        Skip to admin content
      </a>
      <aside className="w-full border-b border-ink/10 bg-filo-cream p-5 md:sticky md:top-0 md:h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3">
          <Link to="/admin" className="font-heading text-lg">FILO <span className="text-[10px] uppercase tracking-[0.2em] text-ink/65">Admin</span></Link>
          <NotificationBell align="start" alignFrom="md" />
        </div>
        <nav className="mt-6 flex gap-1 overflow-x-auto md:flex-col md:overflow-visible" aria-label="Admin">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `flex items-center gap-3 whitespace-nowrap px-3 py-2 text-xs uppercase tracking-[0.15em] transition ${isActive ? "bg-filo-red text-filo-cream" : "text-ink/65 hover:bg-ink/5"}`}>
              <it.icon size={15} /> {it.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="mt-6 inline-block text-[10px] uppercase tracking-[0.2em] text-ink/65 underline underline-offset-4 hover:text-filo-red">
          View storefront
        </Link>
      </aside>
      <main id="admin-main" className="flex-1 p-6 md:p-10"><Outlet /></main>
    </div>
  );
}
