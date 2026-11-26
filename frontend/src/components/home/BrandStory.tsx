import { Container, Section } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { StarMark } from "../brand/StarMark";
import { business } from "../../content/site";

const values = [
  {
    title: "Coffee",
    copy: "Carefully sourced and thoughtfully prepared. We let the cup speak for itself.",
  },
  {
    title: "Matcha",
    copy: "Whisked to order, never rushed. A quieter ritual with its own kind of energy.",
  },
  {
    title: "Hospitality",
    copy: "Warmth without performance. You are welcome here exactly as you are.",
  },
];

export default function BrandStory() {
  return (
    <Section id="story" className="relative overflow-hidden border-y border-ink/10 bg-ivory/60">
      <Container>
        <div className="grid gap-14 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-burgundy-800">
              <span className="h-px w-8 bg-burgundy-800/30" aria-hidden />
              Our Story
            </p>
            <h2 className="mt-6 font-heading text-[clamp(2.5rem,5vw,3.9rem)] leading-[1.04] text-ink">
              Crafted simply.
              <br />
              <span className="italic">Served warmly.</span>
            </h2>
            <p className="mt-7 text-sm leading-[1.95] text-ink/70">
              Filo began with a simple idea: that a small town deserves somewhere genuinely considered —
              where the coffee is thoughtful and there is no reason to rush.
            </p>
            <p className="mt-4 text-sm leading-[1.95] text-ink/70">
              Japanese restraint, Scandinavian warmth. Every detail chosen on purpose, nothing added for
              show.
            </p>
            <p className="mt-8 text-[10px] uppercase tracking-[0.26em] text-ink/65">
              Full story to be shared at launch
            </p>
          </Reveal>

          <div className="md:col-span-6 md:col-start-7">
            <Reveal delay={0.1}>
              <figure className="relative border border-ink/10 bg-cream px-8 py-10 md:px-10 md:py-12">
                <StarMark className="h-6 w-6 text-burgundy-800" />
                <blockquote className="mt-6 font-heading text-[clamp(1.8rem,3.4vw,2.5rem)] italic leading-[1.35] text-ink/85">
                  “A good cup is not complicated. It is just made with care, and given the time it
                  deserves.”
                </blockquote>
                <figcaption className="mt-6 text-[10px] uppercase tracking-[0.26em] text-ink/65">
                  {business.name} · {business.locality}
                </figcaption>
              </figure>
            </Reveal>

            <dl className="mt-10 grid gap-8 sm:grid-cols-3">
              {values.map((value, i) => (
                <Reveal key={value.title} delay={0.1 + i * 0.06}>
                  <dt className="border-t border-ink/15 pt-4 font-heading text-xl text-ink">{value.title}</dt>
                  <dd className="mt-2 text-[13px] leading-[1.85] text-ink/65">{value.copy}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </Section>
  );
}
