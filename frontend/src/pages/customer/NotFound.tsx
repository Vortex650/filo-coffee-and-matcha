import { Link } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { CircleMotif } from "../../components/brand/CircleMotif";
import { StarMark } from "../../components/brand/StarMark";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center bg-cream">
      <Container className="relative text-center">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto hidden w-[30rem] -translate-y-1/2 text-burgundy-800/40 sm:block" aria-hidden>
          <CircleMotif className="h-[30rem] w-[30rem]" rings={4} dashed />
        </div>
        <div className="relative">
          <StarMark className="mx-auto h-6 w-6 text-burgundy-800" />
          <p className="mt-6 text-[10px] uppercase tracking-[0.32em] text-ink/65">404</p>
          <h1 className="mt-4 font-heading text-[clamp(2.6rem,6vw,4rem)] leading-[1.05]">
            This page has
            <br />
            <span className="italic">wandered off.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-ink/65">
            The page you were looking for is not here. Let us point you back to something warm.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center border border-burgundy-800 bg-burgundy-800 px-7 py-3.5 text-[10px] uppercase tracking-[0.26em] text-cream transition hover:bg-burgundy-700 sm:w-auto"
            >
              Back home
            </Link>
            <Link
              to="/menu"
              className="inline-flex w-full items-center justify-center border border-ink/25 px-7 py-3.5 text-[10px] uppercase tracking-[0.26em] text-ink/70 transition hover:border-ink/60 sm:w-auto"
            >
              View the menu
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
