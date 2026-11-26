import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Section } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { register } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

export default function Register() {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", mobile: "" });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await register({ ...form, username: form.email });
      setUser(u);
      toast("Welcome to Filo. Your account is ready.");
      navigate("/account");
    } catch {
      toast("Could not create account. Check your details or try another email.", "error");
    } finally { setLoading(false); }
  };

  const field = "w-full border border-ink/25 bg-transparent p-3 text-sm focus:outline-none focus:border-filo-red";
  const label = "text-[11px] uppercase tracking-[0.2em] text-ink/65";

  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <div className="mx-auto max-w-md">
            <h1 className="font-heading text-5xl">Join Filo.</h1>
            <p className="mt-3 text-sm text-ink/65">Create an account to collect stars and reorder favorites.</p>
            <form onSubmit={submit} className="mt-10 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={label} htmlFor="first">First name</label><input id="first" value={form.first_name} onChange={set("first_name")} className={`${field} mt-2`} /></div>
                <div><label className={label} htmlFor="last">Last name</label><input id="last" value={form.last_name} onChange={set("last_name")} className={`${field} mt-2`} /></div>
              </div>
              <div><label className={label} htmlFor="email">Email</label><input id="email" type="email" value={form.email} onChange={set("email")} className={`${field} mt-2`} required /></div>
              <div><label className={label} htmlFor="mobile">Mobile</label><input id="mobile" value={form.mobile} onChange={set("mobile")} className={`${field} mt-2`} /></div>
              <div><label className={label} htmlFor="password">Password</label><input id="password" type="password" value={form.password} onChange={set("password")} className={`${field} mt-2`} required minLength={8} /></div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating…" : "Create Account"}</Button>
            </form>
            <p className="mt-6 text-sm text-ink/65">Already have an account? <Link to="/login" className="text-filo-red underline underline-offset-4">Sign in</Link></p>
          </div>
        </Container>
      </Section>
    </div>
  );
}
