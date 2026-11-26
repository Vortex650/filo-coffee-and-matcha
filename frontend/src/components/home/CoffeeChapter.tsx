import { Container, Section } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";
import { images } from "../../content/site";
import { Link } from "react-router-dom";

export default function CoffeeChapter() {
  return (
    <Section className="relative overflow-hidden bg-cream">
      <Container size="wide">
        <div className="grid gap-0 md:grid-cols-2">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden bg-ivory md:aspect-auto md:h-full md:min-h-[34rem]">
              <img
                src={images.coffee.src}
                alt={images.coffee.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="pointer-events-none absolute -right-px bottom-0 hidden h-24 w-px bg-cream md:block" aria-hidden />
          </Reveal>

          <div className="relative flex flex-col justify-center bg-burgundy-800 px-7 py-16 text-cream md:px-14 md:py-20 lg:px-20">
            <Reveal delay={0.1}>
              <p className="text-[10px] uppercase tracking-[0.32em] text-cream/60">The Coffee</p>
              <h2 className="mt-6 font-heading text-[clamp(2.5rem,5vw,3.9rem)] leading-[1.02]">
                Made with
                <br />
                <span className="italic text-ivory">intention.</span>
              </h2>
              <div className="mt-7 max-w-md space-y-4 text-[14px] leading-[1.95] text-cream/60">
                <p>
                  A considered blend, dialled in with care. Every shot pulled for balance — bright
                  enough to wake you, warm enough to keep you.
                </p>
                <p>
                  From the first grind of the morning to the last quiet cup of the evening, the detail is
                  the point.
                </p>
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-cream/15 pt-8">
                {[
                  ["Dialled daily", "Every morning"],
                  ["Simple ingredients", "Nothing extra"],
                ].map(([term, detail]) => (
                  <div key={term}>
                    <dt className="text-[9px] uppercase tracking-[0.26em] text-cream/60">{term}</dt>
                    <dd className="mt-2 font-heading text-lg italic text-cream/80">{detail}</dd>
                  </div>
                ))}
              </dl>

              <Link to="/menu" className="mt-10 inline-flex">
                <Button variant="on-dark">Explore coffee</Button>
              </Link>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
