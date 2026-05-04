"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Phase = "intro" | "camera" | "captured" | "scanning" | "verified" | "error";

export function FaceStep() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  useEffect(() => {
    return () => stopStream();
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase("camera");
    } catch {
      setError("We couldn't access your camera. Check browser permissions.");
      setPhase("error");
    }
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dx = (video.videoWidth - size) / 2;
    const dy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, dx, dy, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setSnapshot(dataUrl);
    stopStream();
    setPhase("captured");
  }

  async function submit() {
    if (!snapshot) return;
    setPhase("scanning");
    try {
      const r = await fetch("/api/verify/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfie: snapshot }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(prettyReason(j.reason ?? "unknown"));
        setPhase("error");
        return;
      }
      setPhase("verified");
    } catch {
      setError("Network error. Try again.");
      setPhase("error");
    }
  }

  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-[28px] tracking-tightish text-ink">Live face scan</h1>
          {phase === "verified" && <Badge tone="success" shape="✓">Verified</Badge>}
          {phase === "scanning" && <Badge tone="warning" shape="○">Checking liveness…</Badge>}
        </div>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          A short live capture, matched against your Aadhaar photo. No still images, no uploads
          from camera roll. Look at the camera and stay still for a moment.
        </p>
      </header>

      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-ink hairline">
        {phase === "captured" || phase === "scanning" || phase === "verified" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={snapshot ?? ""} alt="captured selfie" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover scale-x-[-1]"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />

        {/* Framing guide */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={`h-[78%] w-[78%] rounded-full border-2 ${
              phase === "scanning" ? "border-primary pulse-ring" : "border-white/70"
            }`}
          />
        </div>
        {phase === "scanning" && (
          <div className="absolute inset-x-0 bottom-0 bg-black/55 px-4 py-3 text-center text-[13px] text-white">
            Checking liveness…
          </div>
        )}
        {phase === "verified" && (
          <div className="absolute inset-x-0 bottom-0 bg-success/90 px-4 py-3 text-center text-[13.5px] font-medium text-white">
            Verified · Match confirmed
          </div>
        )}
      </div>

      {error && phase === "error" && <p className="text-[13.5px] text-danger">{error}</p>}

      <div className="flex flex-col gap-3">
        {phase === "intro" && (
          <Button size="lg" className="w-full" onClick={startCamera}>
            Open camera
          </Button>
        )}
        {phase === "camera" && (
          <Button size="lg" className="w-full" onClick={capture}>
            Capture
          </Button>
        )}
        {phase === "captured" && (
          <>
            <Button size="lg" className="w-full" onClick={submit}>
              Submit for verification
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => { setSnapshot(null); startCamera(); }}
            >
              Retake
            </Button>
          </>
        )}
        {phase === "scanning" && (
          <Button size="lg" className="w-full" loading disabled>
            Verifying
          </Button>
        )}
        {phase === "verified" && (
          <Button size="lg" className="w-full" onClick={() => router.push("/profile/create")}>
            Build your profile
          </Button>
        )}
        {phase === "error" && (
          <Button variant="secondary" size="lg" className="w-full" onClick={() => { setPhase("intro"); setError(null); setSnapshot(null); }}>
            Try again
          </Button>
        )}
      </div>

      <p className="text-[12.5px] leading-relaxed text-ink-faint">
        Your face data is processed by AWS Rekognition for liveness and match. We retain the match
        score, not the image.
      </p>
    </section>
  );
}

function prettyReason(r: string) {
  const map: Record<string, string> = {
    rate_limited: "Too many attempts. Wait a moment.",
    unauthorized: "Your session expired. Sign in again.",
  };
  return map[r] ?? "We couldn't verify your face. Try again in good light.";
}
