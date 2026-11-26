import { Container, Section } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { CircleMotif } from "../brand/CircleMotif";
import { images } from "../../content/site";

export default function Philosophy() {
  return (
    <Section id="philosophy" className="relative overflow-hidden bg-cream">
      <div className="pointer-events-none absolute -left-56 top-1/3 hidden text-burgundy-800 lg:block" aria-hidden>
        <CircleMotif className="h-[36rem] w-[36rem]" rings={4} dashed />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-14 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-5 md:col-start-1">
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-burgundy-800">
              <span className="h-px w-8 bg-burgundy-800/30" aria-hidden />
              Philosophy
            </p>
            <h2 className="mt-6 font-heading text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.02] text-ink">
              A little pause
              <br />
              in your day.
            </h2>
            <div className="mt-8 space-y-5 text-[15px] leading-[1.95] text-ink/65">
              <p>
                Thoughtfully crafted coffee and matcha, made with simple ingredients and served with
                genuine warmth.
              </p>
              <p>
                We believe good things take a moment — the grind, the whisk, the quiet before the first
                sip. Filo is a place to slow down and let that moment belong to you.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="md:col-span-6 md:col-start-7">
            <figure className="relative">
              <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                <img
                  src={images.philosophy.src}
                  alt={images.philosophy.alt}
                  loading="lazy"
                  width={1100}
                  height={1375}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="absolute -bottom-7 -left-5 max-w-[13rem] border border-ink/10 bg-cream px-6 py-5 md:-left-10">
                <p className="font-heading text-lg italic leading-snug text-ink/75">
                  “Nothing rushed. Nothing extra.”
                </p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
