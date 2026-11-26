import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Container, Section } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { login } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      setUser(u);
      toast(`Welcome back, ${u.first_name || "friend"}.`);
      navigate(location.state?.from || (u.role === "customer" ? "/account" : "/admin"));
    } catch {
      toast("Incorrect email or password.", "error");
    } finally { setLoading(false); }
  };

  const field = "w-full border border-ink/20 bg-transparent p-3 text-sm focus:outline-none focus:border-filo-red";

  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <div className="mx-auto max-w-md">
            <h1 className="font-heading text-5xl">Welcome back.</h1>
            <p className="mt-3 text-sm text-ink/65">Sign in to manage orders, rewards, and your account.</p>
            <form onSubmit={submit} className="mt-10 space-y-5">
              <div><label className="text-[11px] uppercase tracking-[0.2em] text-ink/65" htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${field} mt-2`} required /></div>
              <div><label className="text-[11px] uppercase tracking-[0.2em] text-ink/65" htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${field} mt-2`} required /></div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in…" : "Sign In"}</Button>
            </form>
            <p className="mt-6 text-sm text-ink/65">New here? <Link to="/register" className="text-filo-red underline underline-offset-4">Create an account</Link></p>
          </div>
        </Container>
      </Section>
    </div>
  );
}
