import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { FiArrowDown } from "react-icons/fi";
import { CircleMotif } from "../brand/CircleMotif";
import { StarMark } from "../brand/StarMark";
import { business, ORDERING_ENABLED } from "../../content/site";

const ease = [0.22, 1, 0.36, 1] as const;

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } };
const line: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 1.1, ease } },
};
const fade: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-burgundy-800 text-cream">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="filo-rings-spin relative h-[165vmin] w-[165vmin] shrink-0">
          <CircleMotif className="absolute inset-0 h-full w-full text-cream" rings={7} dashed />
        </div>
        <div className="filo-rings-breathe absolute h-[58vmin] w-[58vmin]">
          <CircleMotif className="h-full w-full text-cream" rings={3} />
        </div>
      </div>

      <motion.div
        variants={stagger}
        initial={reduce ? false : "hidden"}
        animate={reduce ? false : "show"}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-24 text-center md:px-10 md:pb-12 md:pt-24"
      >
        <motion.p variants={fade} className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[9px] uppercase tracking-[0.34em] text-cream/65 md:text-[10px]">
          <StarMark className="h-3 w-3 text-sand" />
          <span>{business.locality}</span>
          <span className="hidden h-1 w-1 rounded-full bg-cream/30 sm:block" aria-hidden />
          <span className="text-sand/90">{business.status}</span>
        </motion.p>

        <h1 className="mt-6 font-heading leading-[0.82] tracking-[-0.02em] md:mt-8">
          <span className="block overflow-hidden pb-2">
            <motion.span variants={line} className="block text-[clamp(4.6rem,15vw,12rem)]">
              Filo
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-3">
            <motion.span variants={line} className="block text-[clamp(4.6rem,15vw,12rem)] italic text-ivory">
              Coffee
              <span className="ml-3 align-middle font-body text-[clamp(0.8rem,1.6vw,1.05rem)] uppercase not-italic tracking-[0.28em] text-cream/60">
                &amp; Matcha
              </span>
            </motion.span>
          </span>
        </h1>

        <motion.p variants={fade} className="mt-7 font-heading text-[clamp(1.25rem,2.6vw,1.8rem)] italic text-cream/70">
          {business.tagline}
        </motion.p>

        <motion.p variants={fade} className="mt-6 max-w-md text-[13px] leading-[1.9] text-cream/60 md:text-sm">
          Specialty coffee and matcha, thoughtfully prepared for moments worth slowing down — coming to {business.locality}.
        </motion.p>

        <motion.div variants={fade} className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/menu"
            className="inline-flex w-full items-center justify-center border border-cream bg-cream px-8 py-4 text-[10px] uppercase tracking-[0.26em] text-burgundy-800 transition duration-300 hover:bg-ivory sm:w-auto"
          >
            Explore the Menu
          </Link>
          <Link
            to="/#story"
            className="inline-flex w-full items-center justify-center border border-cream/30 px-8 py-4 text-[10px] uppercase tracking-[0.26em] text-cream/85 transition duration-300 hover:border-cream hover:bg-cream/10 sm:w-auto"
          >
            Our Story
          </Link>
        </motion.div>

        {!ORDERING_ENABLED && (
          <motion.p variants={fade} className="mt-7 text-[9px] uppercase tracking-[0.28em] text-cream/60">
            Online ordering opens at launch
          </motion.p>
        )}
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-4 border-t border-cream/10 px-5 py-5 text-[9px] uppercase tracking-[0.26em] text-cream/60 sm:flex-row sm:items-center sm:justify-between md:px-10">
        <span>{business.locality}</span>
        <a href="#story" className="inline-flex items-center gap-2 transition hover:text-cream/70">
          <span className="h-8 w-px bg-current" aria-hidden />
          <FiArrowDown className="animate-bounce" size={12} aria-hidden />
          <span>Scroll to explore</span>
        </a>
        <span className="hidden sm:block">{business.status}</span>
      </div>
    </section>
  );
}
