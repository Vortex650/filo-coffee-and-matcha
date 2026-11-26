import { Container, Section } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { images } from "../../content/site";

export default function Atmosphere() {
  return (
    <Section id="atmosphere" className="bg-cream">
      <Container size="wide">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <SectionHeading
            className="md:col-span-6"
            eyebrow="The Space"
            title={
              <>
                Come as you are.
                <br />
                <span className="italic">Stay a little longer.</span>
              </>
            }
            copy="Warm light, quiet corners, and room to breathe. A place built for slow mornings and unhurried afternoons."
          />
          <Reveal delay={0.1} className="md:col-span-5 md:col-start-8">
            <p className="border-l border-ink/15 pl-6 text-sm leading-[1.9] text-ink/65">
              Interior and café photography will be shared closer to opening. Every image on this page is a
              temporary placeholder until then.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-12">
          <Reveal className="sm:col-span-7">
            <figure className="relative aspect-[4/3] overflow-hidden bg-ivory sm:aspect-[5/4]">
              <img
                src={images.atmosphereOne.src}
                alt={images.atmosphereOne.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
          </Reveal>

          <div className="grid gap-5 sm:col-span-5">
            <Reveal delay={0.08}>
              <figure className="relative aspect-[4/3] overflow-hidden bg-ivory">
                <img
                  src={images.atmosphereTwo.src}
                  alt={images.atmosphereTwo.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </figure>
            </Reveal>
            <Reveal delay={0.16}>
              <figure className="relative aspect-[4/3] overflow-hidden bg-ivory">
                <img
                  src={images.atmosphereThree.src}
                  alt={images.atmosphereThree.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </figure>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
