import { Card, CardBody, CardTitle } from "@/components/ui/Card";

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
    <section className="mx-auto max-w-6xl px-6 pb-12">
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="flex flex-col gap-3 p-7">
            <span className="text-[11.5px] uppercase tracking-[0.18em] text-primary-700">
              {f.eyebrow}
            </span>
            <CardTitle>{f.title}</CardTitle>
            <CardBody>{f.body}</CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
