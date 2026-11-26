import { FiInstagram, FiArrowUpRight } from "react-icons/fi";
import { Container, Section } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { business, images } from "../../content/site";

const grid = [images.socialOne, images.socialTwo, images.socialThree, images.socialFour];

export default function Social() {
  return (
    <Section className="bg-cream">
      <Container size="wide">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Follow Along"
            title={
              <>
                Moments from <span className="italic">Filo.</span>
              </>
            }
            copy="Behind the counter, in the cup, and around the table — find us on Instagram."
          />
          <Reveal delay={0.1}>
            <a
              href={business.instagram}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 border-b border-ink/25 pb-2 text-[10px] uppercase tracking-[0.26em] text-ink/70 transition hover:border-burgundy-800 hover:text-burgundy-800"
            >
              <FiInstagram size={15} />
              {business.instagramHandle}
              <FiArrowUpRight size={14} aria-hidden />
            </a>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {grid.map((image, i) => (
            <Reveal key={image.src + i} delay={i * 0.05}>
              <a
                href={business.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${business.instagramHandle} on Instagram`}
                className="group block overflow-hidden bg-ivory"
              >
                <div className="relative aspect-square">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-burgundy-950/0 text-cream opacity-0 transition duration-500 group-hover:bg-burgundy-950/35 group-hover:opacity-100">
                    <FiInstagram size={22} aria-hidden />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-ink/65">
          Temporary imagery · A live feed may follow after launch
        </p>
      </Container>
    </Section>
  );
}
