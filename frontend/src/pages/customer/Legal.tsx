import { Container, Section } from "../../components/ui/Container";

export default function Legal({ title = "Privacy Policy" }: { title?: string }) {
  return (
    <div className="bg-filo-cream">
      <Section>
        <Container>
          <h1 className="font-heading text-5xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink/65">
            This placeholder policy will be replaced with the final legal copy. It covers data collection, order processing, payment verification, and customer communication.
          </p>
        </Container>
      </Section>
    </div>
  );
}
