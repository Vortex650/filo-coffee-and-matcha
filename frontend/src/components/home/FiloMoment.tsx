import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container, Section } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { images } from "../../content/site";

const moments = [
  {
    id: "slow-down",
    label: "Slow Down",
    kicker: "A coffee moment",
    title: "Just you and a good cup.",
    copy: "Something warm, something quiet. Take the long way through your morning and let the coffee do the rest.",
    cta: "Find a coffee",
    image: images.momentCoffee,
  },
  {
    id: "find-balance",
    label: "Find Balance",
    kicker: "A matcha moment",
    title: "A softer kind of energy.",
    copy: "Whisked to order and gently grounding — the pause between everything else you have to do today.",
    cta: "Find a matcha",
    image: images.momentMatcha,
  },
  {
    id: "connect",
    label: "Connect",
    kicker: "A moment to share",
    title: "Stay a little longer.",
    copy: "Two cups, one table, no rush. The best conversations tend to happen somewhere in between.",
    cta: "Explore the menu",
    image: images.momentConnect,
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function FiloMoment() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = moments[active];

  return (
    <Section className="relative overflow-hidden bg-burgundy-950 text-cream">
      <Container>
        <SectionHeading
          eyebrow="The Filo Moment"
          tone="light"
          title={
            <>
              What kind of moment
              <br />
              do you need <span className="italic">today?</span>
            </>
          }
          copy="Choose a feeling. We will point you toward the cup that fits it."
        />

        <div className="mt-14 grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div role="group" aria-label="Choose a moment" className="flex flex-col">
              {moments.map((moment, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={moment.id}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    className={`group flex items-baseline justify-between gap-6 border-b border-cream/10 py-6 text-left transition ${
                      isActive ? "text-cream" : "text-cream/60 hover:text-cream/80"
                    }`}
                  >
                    <span className="flex items-baseline gap-5">
                      <span className="text-[9px] tabular-nums tracking-[0.2em] text-cream/60">
                        0{i + 1}
                      </span>
                      <span className="font-heading text-[clamp(1.9rem,4vw,2.8rem)] leading-none">
                        {moment.label}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`text-sm transition ${isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}
                    >
                      ●
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden bg-burgundy-900">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={current.id}
                    src={current.image.src}
                    alt={current.image.alt}
                    loading="lazy"
                    initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.7, ease }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>

              <div aria-live="polite" className="mt-8 min-h-[11rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.id}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease }}
                  >
                    <p className="text-[9px] uppercase tracking-[0.3em] text-sand/80">{current.kicker}</p>
                    <h3 className="mt-3 font-heading text-[clamp(1.7rem,3vw,2.3rem)] leading-tight">
                      {current.title}
                    </h3>
                    <p className="mt-3 max-w-md text-sm leading-[1.9] text-cream/65">{current.copy}</p>
                    <Link
                      to="/menu"
                      className="mt-6 inline-flex items-center gap-3 border-b border-cream/25 pb-2 text-[10px] uppercase tracking-[0.26em] text-cream/80 transition hover:border-cream hover:text-cream"
                    >
                      {current.cta}
                      <span aria-hidden>→</span>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
