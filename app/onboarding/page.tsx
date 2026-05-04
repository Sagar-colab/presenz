import { OnboardingShell } from "@/components/onboarding/Shell";
import { PhoneStep } from "@/components/onboarding/PhoneStep";

export const metadata = { title: "Sign up — Presenz" };

export default function OnboardingPage() {
  return (
    <OnboardingShell step={1} total={4} stepLabel="Phone · Step 1 of 4">
      <PhoneStep />
    </OnboardingShell>
  );
}
