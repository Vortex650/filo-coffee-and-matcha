import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Wordmark } from "./components/brand/Wordmark";
import { CircleMotif } from "./components/brand/CircleMotif";

const Home = lazy(() => import("./pages/customer/Home"));
const Menu = lazy(() => import("./pages/customer/Menu"));
const Product = lazy(() => import("./pages/customer/Product"));
const Cart = lazy(() => import("./pages/customer/Cart"));
const Checkout = lazy(() => import("./pages/customer/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/customer/OrderConfirmation"));
const TrackOrder = lazy(() => import("./pages/customer/TrackOrder"));
const Loyalty = lazy(() => import("./pages/customer/Loyalty"));
const Reservations = lazy(() => import("./pages/customer/Reservations"));
const Careers = lazy(() => import("./pages/customer/Careers"));
const Account = lazy(() => import("./pages/customer/Account"));
const Notifications = lazy(() => import("./pages/customer/Notifications"));
const Contact = lazy(() => import("./pages/customer/Contact"));
const Legal = lazy(() => import("./pages/customer/Legal"));
const Login = lazy(() => import("./pages/customer/Login"));
const Register = lazy(() => import("./pages/customer/Register"));
const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard"));
const StaffOrders = lazy(() => import("./pages/staff/StaffOrders"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminMenu = lazy(() => import("./pages/admin/AdminMenu"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminLoyalty = lazy(() => import("./pages/admin/AdminLoyalty"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminReservations = lazy(() => import("./pages/admin/AdminReservations"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const NotFound = lazy(() => import("./pages/customer/NotFound"));

function Fallback() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-burgundy-800 text-cream">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="filo-rings-breathe h-[80vmin] w-[80vmin]">
          <CircleMotif className="h-full w-full text-cream" rings={4} dashed />
        </div>
      </div>
      <div className="relative flex flex-col items-center gap-4">
        <Wordmark className="text-[18px]" tone="cream" />
        <p className="text-[9px] uppercase tracking-[0.3em] text-cream/60" role="status">
          Loading
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:code" element={<OrderConfirmation />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/rewards" element={<Loyalty />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/account" element={<Account />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Legal title="Privacy Policy" />} />
            <Route path="/terms" element={<Legal title="Terms" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/staff" element={<ProtectedRoute staffOnly><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/orders" element={<ProtectedRoute staffOnly><StaffOrders /></ProtectedRoute>} />
          </Route>
          <Route path="/admin" element={<ProtectedRoute staffOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="loyalty" element={<AdminLoyalty />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
