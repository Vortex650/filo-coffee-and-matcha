import { Container, Section } from "../../components/ui/Container";
import { SectionHeading } from "../../components/ui/SectionHeading";

export default function Contact() {
  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <SectionHeading level={1} eyebrow="Contact" title="Say hello." copy="Contact details and hours are configurable until confirmed." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="border border-ink/10 p-6"><p className="text-[11px] uppercase tracking-[0.2em] text-ink/65">Location</p><p className="mt-3">Reina Mercedes, Isabela</p></div>
            <div className="border border-ink/10 p-6"><p className="text-[11px] uppercase tracking-[0.2em] text-ink/65">Hours</p><p className="mt-3">To be confirmed</p></div>
            <div className="border border-ink/10 p-6"><p className="text-[11px] uppercase tracking-[0.2em] text-ink/65">Instagram</p><p className="mt-3">@filocoffee.ph</p></div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
