import { OnboardingShell } from "@/components/onboarding/Shell";
import { AadhaarStep } from "@/components/onboarding/AadhaarStep";

export const metadata = { title: "Verify Aadhaar — Présenz" };

export default function VerifyAadhaarPage() {
  return (
    <OnboardingShell step={2} total={4} stepLabel="Aadhaar · Step 2 of 4">
      <AadhaarStep />
    </OnboardingShell>
  );
}
