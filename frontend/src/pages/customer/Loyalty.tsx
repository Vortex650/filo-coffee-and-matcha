import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Container, Section } from "../../components/ui/Container";
import { EmptyState, Skeleton } from "../../components/ui/States";

export default function Loyalty() {
  const [acc, setAcc] = useState<any>(null);
  const [tx, setTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.allSettled([
      api.get("/loyalty/me/").then((r) => setAcc(r.data)),
      api.get("/loyalty/transactions/").then((r) => setTx(r.data.results ?? r.data)),
    ]).finally(() => setLoading(false));
  }, []);
  const stars = acc?.stars ?? 0;
  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <p className="text-xs uppercase tracking-[0.3em] text-filo-red">Rewards</p>
          <h1 className="mt-4 font-heading text-5xl">Your Filo Card</h1>
          <div className="mt-10 border border-ink/10 p-8 max-w-md">
            {loading ? (
              <div className="space-y-4" aria-live="polite">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24" />
                <Skeleton className="h-4 w-48" />
                <span className="sr-only">Loading rewards</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-ink/65">{stars} of 10 stars</p>
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`flex aspect-square items-center justify-center border ${i < stars ? "border-filo-red bg-filo-red text-filo-cream" : "border-ink/20 text-ink/65"}`}>
                      <span className="text-lg" aria-hidden>✦</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm text-ink/65">
                  {stars >= 10 ? "You have a free drink reward." : stars >= 5 ? "You can redeem 50% off a drink." : `${10 - stars} stars to your next reward.`}
                </p>
              </>
            )}
          </div>
          <h2 className="mt-12 font-heading text-2xl">History</h2>
          {loading ? (
            <div className="mt-4 space-y-2">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-9" />)}
            </div>
          ) : tx.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No rewards activity yet." copy="Stars you earn and redeem will appear here." />
            </div>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-ink/70">
              {tx.map((t) => <li key={t.id} className="flex justify-between border-b border-ink/10 pb-2"><span className="capitalize">{String(t.transaction_type).replace("_", " ")}</span><span>{t.stars > 0 ? "+" : ""}{t.stars}</span></li>)}
            </ul>
          )}
        </Container>
      </Section>
    </div>
  );
}
