import Link from "next/link";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient backdrop — two soft blobs orbiting a tinted base */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-alt to-surface" />
        <div
          className="drift-a absolute -top-24 left-[12%] h-[460px] w-[460px] rounded-full blur-3xl"
          style={{ background: "rgba(83, 74, 183, 0.18)" }}
        />
        <div
          className="drift-b absolute top-[18%] right-[-6%] h-[420px] w-[420px] rounded-full blur-3xl"
          style={{ background: "rgba(74, 183, 168, 0.18)" }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-28 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <Reveal>
              <p className="text-[12.5px] uppercase tracking-[0.22em] text-ink-faint">
                Invitation-only · India
              </p>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-5 text-[52px] font-semibold leading-[1.02] tracking-tightish text-ink md:text-[80px]">
                Meet in person.
                <br />
                <span className="text-primary">Or not at all.</span>
              </h1>
            </Reveal>
            <Reveal delay={260}>
              <p className="mt-6 max-w-prose text-[16.5px] leading-relaxed text-ink-soft md:text-[17.5px]">
                Presenz matches you with one real person a day. No endless swiping. No ghosting.
                Just a real date.
              </p>
            </Reveal>
            <Reveal delay={400}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/onboarding"
                  className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-[15px] font-medium text-white transition-all duration-200 hover:bg-primary-600 active:scale-[0.97]"
                >
                  Request an invite
                </Link>
                <Link
                  href="#how"
                  className="inline-flex h-12 items-center rounded-xl bg-white px-5 text-[15px] font-medium text-ink hairline transition-all duration-200 hover:bg-surface-alt active:scale-[0.97]"
                >
                  How it works
                </Link>
              </div>
            </Reveal>
            <Reveal delay={520}>
              <p className="mt-5 text-[13px] text-ink-faint">
                Verified by phone, Aadhaar, and a live face scan. We take care of who's real so you
                can take care of who's right.
              </p>
            </Reveal>
          </div>

          <div className="md:col-span-5">
            <Reveal delay={300}>
              <PhoneMock />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneMock() {
  return (
    <div className="relative mx-auto max-w-[360px]">
      {/* Pulsing soft glow behind the phone */}
      <div
        aria-hidden
        className="glow-pulse pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 rounded-[48px]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(83,74,183,0.32) 0%, rgba(74,183,168,0.10) 55%, transparent 75%)",
          filter: "blur(36px)",
        }}
      />

      {/* Floating phone — gentle hover-straighten */}
      <div className="float">
        <div
          className="group relative rounded-[40px] bg-ink p-2 shadow-[0_30px_80px_-30px_rgba(15,15,20,0.5)] rotate-[-3deg] transition-transform duration-500 ease-out hover:rotate-0 hover:scale-[1.02]"
        >
          <div className="rounded-[32px] bg-white p-4 md:p-5">
            {/* Notch */}
            <div className="mx-auto mb-3 mt-1 h-1.5 w-20 rounded-full bg-surface-line" />
            <PhoneCardContent />
          </div>
        </div>
      </div>
    </div>
  );
}

const demoPrompts = [
  { label: "I'll never compromise on", answer: "My patients and my sleep." },
  { label: "First date energy", answer: "Coffee, no pagers, no small talk." },
  { label: "Currently obsessed with", answer: "Making people feel seen, inside and outside the clinic." },
  { label: "I'm looking for", answer: "Someone who understands that showing up is everything." },
] as const;

function PhoneCardContent() {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">
          Today's match
        </span>
        <span className="verify-pulse inline-flex items-center gap-1.5 rounded-full bg-[#E8F4ED] px-2.5 py-1 text-[11.5px] font-medium text-success">
          <span aria-hidden>✓</span> Verified
        </span>
      </div>
      <div className="mt-4 aspect-[4/5] w-full overflow-hidden rounded-xl hairline bg-[#F4E5D0]">
        <AnushaAvatar className="h-full w-full" />
      </div>
      <div className="mt-4">
        <h3 className="text-[18px] font-semibold tracking-tightish text-ink">Anusha, 23</h3>
        <p className="text-[13px] text-ink-muted">Bengaluru · Doctor</p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
          I spend my days making life-altering decisions, but off-duty I'm just someone who loves
          farmers markets and a good novel. Medicine teaches you how precious time is — so I'd
          rather spend mine on things and people that actually matter.
        </p>
      </div>
      <ul className="mt-4 space-y-3 border-t border-surface-line pt-4">
        {demoPrompts.map((p) => (
          <li key={p.label}>
            <p className="text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">{p.label}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{p.answer}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-surface-line pt-3 text-[11.5px] text-ink-muted">
        <span>3 messages remaining</span>
        <span>Expires in 22h</span>
      </div>
    </>
  );
}

// Flat editorial portrait — warm palette, minimal lines.
function AnushaAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustrated portrait of Anusha"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>
        <linearGradient id="anusha-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7E6D0" />
          <stop offset="100%" stopColor="#EAD0AE" />
        </linearGradient>
        <linearGradient id="anusha-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A65240" />
          <stop offset="100%" stopColor="#7E3B2C" />
        </linearGradient>
      </defs>

      <rect width="400" height="500" fill="url(#anusha-bg)" />
      <circle cx="200" cy="240" r="170" fill="#FFFFFF" opacity="0.18" />

      <path
        d="M 108 230 Q 96 360 128 470 L 272 470 Q 304 360 292 230 L 292 198 L 108 198 Z"
        fill="#231613"
      />

      <path d="M 178 348 L 178 412 Q 200 422 222 412 L 222 348 Z" fill="#C68B66" />
      <path
        d="M 178 396 Q 200 414 222 396 L 222 412 Q 200 422 178 412 Z"
        fill="#A87245"
        opacity="0.55"
      />

      <path d="M 40 500 Q 78 408 200 402 Q 322 408 360 500 Z" fill="url(#anusha-top)" />
      <path
        d="M 162 412 Q 200 432 238 412 Q 220 426 200 426 Q 180 426 162 412 Z"
        fill="#5A2B1F"
        opacity="0.6"
      />

      <ellipse cx="200" cy="265" rx="80" ry="96" fill="#D5A37A" />
      <ellipse cx="158" cy="298" rx="18" ry="11" fill="#C2855E" opacity="0.45" />
      <ellipse cx="242" cy="298" rx="18" ry="11" fill="#C2855E" opacity="0.45" />

      <path
        d="M 118 232
           Q 128 178 200 158
           Q 272 178 282 232
           Q 270 212 248 214
           Q 230 246 200 236
           Q 170 246 152 214
           Q 130 212 118 232 Z"
        fill="#231613"
      />
      <path d="M 110 232 Q 100 350 128 412 L 144 408 Q 122 350 128 240 Z" fill="#231613" />
      <path d="M 290 232 Q 300 350 272 412 L 256 408 Q 278 350 272 240 Z" fill="#231613" />

      <path d="M 165 250 Q 176 245 188 250" stroke="#231613" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 212 250 Q 224 245 235 250" stroke="#231613" strokeWidth="3" fill="none" strokeLinecap="round" />

      <path d="M 165 274 Q 177 282 188 274" stroke="#231613" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M 212 274 Q 224 282 235 274" stroke="#231613" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M 187 274 L 191 270" stroke="#231613" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 234 274 L 238 270" stroke="#231613" strokeWidth="1.6" strokeLinecap="round" />

      <path
        d="M 200 286 Q 197 308 194 312 Q 200 318 206 312 Q 203 308 200 286"
        stroke="#B2825D"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      <path d="M 184 332 Q 200 342 216 332" stroke="#8E4533" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M 188 333 Q 200 339 212 333" fill="#B0594A" opacity="0.4" />

      <circle cx="200" cy="218" r="3.2" fill="#9B2C2C" />
      <circle cx="118" cy="302" r="4" fill="#C8A46C" />
      <circle cx="282" cy="302" r="4" fill="#C8A46C" />
    </svg>
  );
}
