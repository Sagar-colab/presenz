import { OnboardingShell } from "@/components/onboarding/Shell";
import { FaceStep } from "@/components/onboarding/FaceStep";

export const metadata = { title: "Live face scan — Présenz" };

export default function VerifyFacePage() {
  return (
    <OnboardingShell step={3} total={4} stepLabel="Face scan · Step 3 of 4">
      <FaceStep />
    </OnboardingShell>
  );
}
