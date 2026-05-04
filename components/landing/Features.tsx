import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Reveal } from "./Reveal";

const features = [
  {
    eyebrow: "Trust",
    title: "Verified humans only",
    body: "Every member completes phone, Aadhaar, and a live face check. No bots. No catfish. No fake profiles.",
  },
  {
    eyebrow: "Intentional",
    title: "7 questions, 3 messages",
    body: "A short, considered profile and a hard cap of three messages. Just enough to know if you'd like to meet.",
  },
  {
    eyebrow: "Calm",
    title: "One match a day",
    body: "We send you one person, chosen carefully. No infinite scroll. No 2 a.m. dopamine. Just real attention.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-12 pt-12">
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 120}>
            <Card className="flex h-full flex-col gap-3 p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-30px_rgba(15,15,20,0.18)]">
              <span className="text-[11.5px] uppercase tracking-[0.18em] text-primary-700">
                {f.eyebrow}
              </span>
              <CardTitle>{f.title}</CardTitle>
              <CardBody>{f.body}</CardBody>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
