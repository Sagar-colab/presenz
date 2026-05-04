import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-28 md:pb-28">
      <div className="grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-[12.5px] uppercase tracking-[0.22em] text-ink-faint">
            Invitation-only · India
          </p>
          <h1 className="mt-5 text-[44px] leading-[1.04] tracking-tightish text-ink md:text-[64px]">
            Meet in person.
            <br />
            <span className="text-primary">Or not at all.</span>
          </h1>
          <p className="mt-6 max-w-prose text-[16.5px] leading-relaxed text-ink-soft md:text-[17.5px]">
            Presenz matches you with one real person a day. No endless swiping. No ghosting. Just a
            real date.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-[15px] font-medium text-white hover:bg-primary-600"
            >
              Request an invite
            </Link>
            <Link
              href="#how"
              className="inline-flex h-12 items-center rounded-xl bg-white px-5 text-[15px] font-medium text-ink hairline hover:bg-surface-alt"
            >
              How it works
            </Link>
          </div>
          <p className="mt-5 text-[13px] text-ink-faint">
            Verified by phone, Aadhaar, and a live face scan. We take care of who's real so you can
            take care of who's right.
          </p>
        </div>

        <div className="md:col-span-5">
          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="rounded-2xl bg-white hairline p-6 md:p-7">
        <div className="flex items-center justify-between">
          <span className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">
            Today's match
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F4ED] px-2.5 py-1 text-[11.5px] font-medium text-success">
            <span aria-hidden>✓</span> Verified
          </span>
        </div>
        <div className="mt-5 aspect-[4/5] w-full overflow-hidden rounded-xl hairline bg-[#F4E5D0]">
          <AnuAvatar className="h-full w-full" />
        </div>
        <div className="mt-5">
          <h3 className="text-[19px] font-semibold tracking-tightish text-ink">Anu, 29</h3>
          <p className="text-[13.5px] text-ink-muted">Bengaluru · Architect</p>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
            "I'll always make time for a slow Sunday lunch and a long, unhurried walk after."
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-surface-line pt-4 text-[12.5px] text-ink-muted">
          <span>3 messages remaining</span>
          <span>Expires in 22h</span>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl bg-primary-50 -z-10" aria-hidden />
    </div>
  );
}

// Flat editorial portrait — warm palette, minimal lines, fills the parent's aspect ratio.
function AnuAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustrated portrait of Anu"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>
        <linearGradient id="anu-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7E6D0" />
          <stop offset="100%" stopColor="#EAD0AE" />
        </linearGradient>
        <linearGradient id="anu-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A65240" />
          <stop offset="100%" stopColor="#7E3B2C" />
        </linearGradient>
      </defs>

      {/* Backdrop */}
      <rect width="400" height="500" fill="url(#anu-bg)" />
      <circle cx="200" cy="240" r="170" fill="#FFFFFF" opacity="0.18" />

      {/* Hair — back silhouette */}
      <path
        d="M 108 230 Q 96 360 128 470 L 272 470 Q 304 360 292 230 L 292 198 L 108 198 Z"
        fill="#231613"
      />

      {/* Neck */}
      <path d="M 178 348 L 178 412 Q 200 422 222 412 L 222 348 Z" fill="#C68B66" />
      <path
        d="M 178 396 Q 200 414 222 396 L 222 412 Q 200 422 178 412 Z"
        fill="#A87245"
        opacity="0.55"
      />

      {/* Top / blouse */}
      <path
        d="M 40 500 Q 78 408 200 402 Q 322 408 360 500 Z"
        fill="url(#anu-top)"
      />
      {/* Top neckline highlight */}
      <path
        d="M 162 412 Q 200 432 238 412 Q 220 426 200 426 Q 180 426 162 412 Z"
        fill="#5A2B1F"
        opacity="0.6"
      />

      {/* Face */}
      <ellipse cx="200" cy="265" rx="80" ry="96" fill="#D5A37A" />

      {/* Cheek warmth */}
      <ellipse cx="158" cy="298" rx="18" ry="11" fill="#C2855E" opacity="0.45" />
      <ellipse cx="242" cy="298" rx="18" ry="11" fill="#C2855E" opacity="0.45" />

      {/* Hair — front bangs over forehead */}
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

      {/* Side hair flowing past face */}
      <path
        d="M 110 232 Q 100 350 128 412 L 144 408 Q 122 350 128 240 Z"
        fill="#231613"
      />
      <path
        d="M 290 232 Q 300 350 272 412 L 256 408 Q 278 350 272 240 Z"
        fill="#231613"
      />

      {/* Eyebrows */}
      <path
        d="M 165 250 Q 176 245 188 250"
        stroke="#231613"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 212 250 Q 224 245 235 250"
        stroke="#231613"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Eyes — gentle closed-arc, peaceful editorial style */}
      <path
        d="M 165 274 Q 177 282 188 274"
        stroke="#231613"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 212 274 Q 224 282 235 274"
        stroke="#231613"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Tiny lash flicks */}
      <path d="M 187 274 L 191 270" stroke="#231613" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 234 274 L 238 270" stroke="#231613" strokeWidth="1.6" strokeLinecap="round" />

      {/* Nose — minimal hint */}
      <path
        d="M 200 286 Q 197 308 194 312 Q 200 318 206 312 Q 203 308 200 286"
        stroke="#B2825D"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Mouth — subtle smile */}
      <path
        d="M 184 332 Q 200 342 216 332"
        stroke="#8E4533"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 188 333 Q 200 339 212 333"
        fill="#B0594A"
        opacity="0.4"
      />

      {/* Bindi */}
      <circle cx="200" cy="218" r="3.2" fill="#9B2C2C" />

      {/* Earrings */}
      <circle cx="118" cy="302" r="4" fill="#C8A46C" />
      <circle cx="282" cy="302" r="4" fill="#C8A46C" />
    </svg>
  );
}
