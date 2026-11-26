import { Link } from "react-router-dom";
import { Container, Section } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { images } from "../../content/site";

export default function MatchaChapter() {
  return (
    <Section className="relative overflow-hidden bg-matcha-soft">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-cream/40 lg:block" aria-hidden />

      <Container className="relative">
        <div className="grid items-center gap-14 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-matcha">
              <span className="h-px w-8 bg-matcha/40" aria-hidden />
              The Matcha
            </p>
            <h2 className="mt-6 font-heading text-[clamp(2.5rem,5.4vw,4rem)] leading-[1.02] text-ink">
              Find your
              <br />
              <span className="italic">moment of matcha.</span>
            </h2>
            <p className="mt-7 max-w-sm text-[15px] leading-[1.95] text-ink/65">
              Matcha, given its own time. Softly vegetal, gently sweet, and unhurried — a quieter kind of
              energy for the middle of your day.
            </p>
            <p className="mt-4 max-w-sm text-[15px] leading-[1.95] text-ink/65">
              However it is served, it is made for slowing down. A small ritual with its own kind of
              calm.
            </p>
            <Link
              to="/menu"
              className="group mt-9 inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-[10px] uppercase tracking-[0.26em] text-ink/70 transition hover:border-matcha hover:text-matcha"
            >
              Explore matcha
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>

          <div className="md:col-span-5 md:col-start-8">
            <Reveal delay={0.12}>
              <figure className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full border border-matcha/20 bg-cream">
                <img
                  src={images.matcha.src}
                  alt={images.matcha.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </figure>
              <figcaption className="mt-8 text-center text-[9px] uppercase tracking-[0.28em] text-ink/65">
                Matcha, in its own time
              </figcaption>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
