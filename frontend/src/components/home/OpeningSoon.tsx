import { Link } from "react-router-dom";
import { FiInstagram, FiArrowRight } from "react-icons/fi";
import { Container } from "../ui/Container";
import { CircleMotif } from "../brand/CircleMotif";
import { StarMark } from "../brand/StarMark";
import { Reveal } from "../ui/Reveal";
import { business } from "../../content/site";

export default function OpeningSoon() {
  return (
    <section id="opening-soon" className="relative overflow-hidden bg-burgundy-900 text-cream">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="filo-rings-breathe h-[92vmin] w-[92vmin] shrink-0">
          <CircleMotif className="h-full w-full text-cream" rings={6} dashed />
        </div>
      </div>

      <Container className="relative py-24 md:py-32">
        <Reveal className="mx-auto max-w-xl text-center">
          <StarMark className="mx-auto h-5 w-5 text-sand" />
          <p className="mt-6 text-[10px] uppercase tracking-[0.34em] text-cream/60">
            {business.locality} · {business.status}
          </p>
          <h2 className="mt-6 font-heading text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.02]">
            Be the first
            <br />
            <span className="italic text-ivory">to know.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-[1.9] text-cream/65">
            We are not quite ready to open our doors. Follow along for the first look, and the day we
            finally do.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href={business.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-3 border border-cream bg-cream px-7 py-4 text-[10px] uppercase tracking-[0.26em] text-burgundy-800 transition duration-300 hover:bg-ivory sm:w-auto"
            >
              <FiInstagram size={15} aria-hidden />
              Follow {business.instagramHandle}
            </a>
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center gap-3 border border-cream/30 px-7 py-4 text-[10px] uppercase tracking-[0.26em] text-cream/85 transition duration-300 hover:border-cream hover:bg-cream/10 sm:w-auto"
            >
              Get in touch
              <FiArrowRight size={14} aria-hidden />
            </Link>
          </div>

          <p className="mt-7 text-[9px] uppercase tracking-[0.28em] text-cream/60">
            No opening date confirmed yet
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
