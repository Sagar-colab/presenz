"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay?: new (opts: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: () => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
}

function loadCheckoutScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function SubscribeButton({
  tier,
  label,
  variant = "primary",
}: {
  tier: "PLUS" | "CONCIERGE";
  label: string;
  variant?: "primary" | "ghost";
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCheckoutScript();
  }, []);

  async function start() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const ok = await loadCheckoutScript();
      if (!ok) {
        setErr("Could not load payment SDK. Check your connection.");
        return;
      }
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const j = await res.json();
      if (!j.ok) {
        setErr(j.reason === "payments_not_configured"
          ? "Payments are not yet enabled. Please check back soon."
          : j.reason === "plan_not_provisioned"
            ? "This plan is not provisioned yet — admin needs to run setup."
            : `Could not start checkout: ${j.reason ?? res.status}`);
        return;
      }
      if (!j.keyId) {
        setErr("Public Razorpay key not configured.");
        return;
      }
      if (!window.Razorpay) {
        setErr("Razorpay SDK failed to load.");
        return;
      }
      const rzp = new window.Razorpay({
        key: j.keyId,
        subscription_id: j.razorpaySubId,
        name: "Presenz",
        description: `${tier === "PLUS" ? "Presenz+" : "Concierge"} subscription`,
        handler: () => router.refresh(),
        modal: { ondismiss: () => setBusy(false) },
        theme: { color: "#111111" },
      });
      rzp.open();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={start}
        disabled={busy}
        className={
          variant === "primary"
            ? "w-full rounded-md bg-primary px-4 py-2.5 text-[14px] font-medium text-white hover:bg-primary-600 disabled:opacity-50"
            : "w-full rounded-md border border-surface-line px-4 py-2.5 text-[14px] font-medium text-ink hover:bg-surface-alt disabled:opacity-50"
        }
      >
        {busy ? "Opening checkout…" : label}
      </button>
      {err && <p className="mt-2 text-[12px] text-red-600">{err}</p>}
    </div>
  );
}
