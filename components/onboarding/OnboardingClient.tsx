"use client";

import { useState } from "react";
import { OnboardingShell } from "@/components/onboarding/Shell";
import { InviteCodeStep } from "@/components/onboarding/InviteCodeStep";
import { PhoneStep } from "@/components/onboarding/PhoneStep";

export function OnboardingClient() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  if (!inviteCode) {
    return (
      <OnboardingShell step={0} total={4} stepLabel="Invite · Step 0 of 4">
        <InviteCodeStep onValid={(c) => setInviteCode(c)} />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell step={1} total={4} stepLabel="Phone · Step 1 of 4">
      <PhoneStep inviteCode={inviteCode} />
    </OnboardingShell>
  );
}
