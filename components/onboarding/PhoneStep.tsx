"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Mode = "enter" | "code";

export function PhoneStep({ inviteCode }: { inviteCode?: string } = {}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("enter");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (mode !== "code" || secondsLeft <= 0) return;
    tickRef.current = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [mode, secondsLeft]);

  async function sendCode() {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, inviteCode }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(prettyReason(j.reason ?? "unknown"));
        return;
      }
      setMode("code");
      setSecondsLeft(Math.floor((j.expiresInMs ?? 600_000) / 1000));
      setAttemptsLeft(j.maxAttempts ?? 3);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        if (typeof j.attemptsRemaining === "number") setAttemptsLeft(j.attemptsRemaining);
        setError(prettyReason(j.reason ?? "unknown"));
        return;
      }
      const result = await signIn("credentials", { phone, code, redirect: false });
      if (result?.error) {
        setError("Sign-in failed. Try again.");
        return;
      }
      router.push("/verify/aadhaar");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "enter") {
    return (
      <section className="space-y-7">
        <header className="space-y-2">
          <h1 className="text-[28px] tracking-tightish text-ink">What's your number?</h1>
          <p className="text-[15px] leading-relaxed text-ink-muted">
            We'll text you a six-digit code. Indian mobile numbers only — Presenz is currently
            invitation-only in India.
          </p>
        </header>
        <Input
          inputMode="tel"
          autoComplete="tel"
          placeholder="98XXXXXXXX"
          leadingAdornment="+91"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
          maxLength={10}
          error={error ?? undefined}
        />
        <Button
          size="lg"
          loading={loading}
          disabled={phone.replace(/\D/g, "").length < 10}
          onClick={sendCode}
          className="w-full"
        >
          Send code
        </Button>
        <p className="text-[12.5px] leading-relaxed text-ink-faint">
          By continuing you agree to our Terms and Privacy. We never share your number.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-[28px] tracking-tightish text-ink">Enter your code</h1>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          We sent a six-digit code to <span className="text-ink-soft">+91 {phone}</span>.
          {secondsLeft > 0 && (
            <> It expires in <span className="tabular-nums">{formatTime(secondsLeft)}</span>.</>
          )}
        </p>
      </header>
      <Input
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="• • • • • •"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        maxLength={6}
        error={error ?? undefined}
        hint={attemptsLeft < 3 ? `${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left` : undefined}
        className="tracking-[0.4em] text-center text-lg"
      />
      <Button
        size="lg"
        loading={loading}
        disabled={code.length !== 6}
        onClick={verifyCode}
        className="w-full"
      >
        Verify
      </Button>
      <div className="flex items-center justify-between text-[13px]">
        <button
          type="button"
          onClick={() => { setMode("enter"); setCode(""); setError(null); }}
          className="text-ink-muted hover:text-ink"
        >
          ← Change number
        </button>
        <button
          type="button"
          onClick={sendCode}
          disabled={secondsLeft > 540 || loading}
          className="text-primary disabled:text-ink-faint"
        >
          Resend code
        </button>
      </div>
    </section>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function prettyReason(r: string) {
  const map: Record<string, string> = {
    invalid_phone: "That doesn't look like an Indian mobile number.",
    rate_limited: "Too many requests. Wait a moment.",
    phone_rate_limited: "Too many codes sent to this number. Try again later.",
    expired: "That code expired. Send a new one.",
    invalid_code: "That code didn't match.",
    locked_out: "Too many wrong attempts. Send a new code.",
    no_active_otp: "Send a new code first.",
    sms_failed: "We couldn't send the code. Try again.",
    invite_required: "An invite code is required to join.",
    invite_invalid: "That invite code isn't valid.",
    invite_used: "That invite has already been used.",
  };
  return map[r] ?? "Something went wrong. Try again.";
}
