import { Link } from "react-router-dom";
import { FiArrowUpRight, FiInstagram, FiMapPin } from "react-icons/fi";
import { Container, Section } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { business } from "../../content/site";

export default function Location() {
  return (
    <Section id="find-us" className="border-t border-ink/10 bg-ivory/50">
      <Container>
        <div className="grid gap-14 md:grid-cols-12">
          <SectionHeading
            className="md:col-span-5"
            eyebrow="Find Us"
            title={
              <>
                Your next
                <br />
                <span className="italic">favorite place.</span>
              </>
            }
            copy="Somewhere in Reina Mercedes, Isabela — close enough for locals, worth the drive for everyone else."
          />

          <div className="md:col-span-6 md:col-start-7">
            <dl className="divide-y divide-ink/10 border-y border-ink/10">
              <div className="grid gap-2 py-6 sm:grid-cols-3 sm:gap-6">
                <dt className="text-[10px] uppercase tracking-[0.26em] text-ink/65">Location</dt>
                <dd className="sm:col-span-2">
                  <p className="font-heading text-xl">{business.locality}</p>
                  <p className="mt-1 text-sm text-ink/65">Full address to be confirmed</p>
                  <a
                    href={business.maps}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-burgundy-800 transition hover:text-burgundy-700"
                  >
                    <FiMapPin size={13} aria-hidden />
                    Open in Google Maps
                    <FiArrowUpRight size={12} aria-hidden />
                  </a>
                </dd>
              </div>

              <div className="grid gap-2 py-6 sm:grid-cols-3 sm:gap-6">
                <dt className="text-[10px] uppercase tracking-[0.26em] text-ink/65">Hours</dt>
                <dd className="sm:col-span-2">
                  <p className="font-heading text-xl">To be confirmed</p>
                  <p className="mt-1 text-sm text-ink/65">Opening hours will be shared before launch.</p>
                </dd>
              </div>

              <div className="grid gap-2 py-6 sm:grid-cols-3 sm:gap-6">
                <dt className="text-[10px] uppercase tracking-[0.26em] text-ink/65">Contact</dt>
                <dd className="sm:col-span-2">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 font-heading text-xl transition hover:text-burgundy-800"
                  >
                    Send us a note
                    <FiArrowUpRight size={16} aria-hidden />
                  </Link>
                  <div className="mt-3 flex items-center gap-5 text-ink/65">
                    <a
                      href={business.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs transition hover:text-burgundy-800"
                    >
                      <FiInstagram size={14} aria-hidden />
                      {business.instagramHandle}
                    </a>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-14 border border-ink/10 bg-cream px-6 py-10 text-center md:px-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink/65">Map</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/65">
              An exact pin will be added once the address is confirmed. Until then, Reina Mercedes,
              Isabela is the place to find us.
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
