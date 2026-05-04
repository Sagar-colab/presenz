# Présenz

Meet in person. Or not at all.

A premium dating app built around verified identity, intentional matching, and limited messaging — one match a day, three messages, then meet.

## Stack
- Next.js 14 (app router) + TypeScript strict
- Tailwind CSS (Inter, primary `#534AB7`)
- PostgreSQL + Prisma
- NextAuth (Credentials provider, phone OTP)
- Service stubs for Twilio, DigiLocker, AWS Rekognition, Cloudinary, Google Vision

## Quick start
```bash
pnpm install
cp .env.example .env
# edit DATABASE_URL + NEXTAUTH_SECRET (openssl rand -base64 32)
pnpm db:push
pnpm dev
```

In dev, all third-party integrations are stubbed: OTPs print to the server console, Aadhaar/face/NSFW checks return success after a short delay, and uploads write to `public/uploads/`.

## Folders
- `app/` — pages, layouts, route handlers
- `components/` — shared UI
- `lib/` — db client, auth, services, utils, rate limiter
- `prisma/` — schema
- `public/` — assets (and dev-only `uploads/`)

## Architecture notes
- All third-party integrations sit behind interfaces in `lib/services/`. To go live, fill the env vars and swap the stub implementation for the real one — no UI changes needed.
- API routes are rate-limited via `lib/rate-limit.ts` (in-memory token bucket; swap for Upstash/Redis in prod).
- Messaging is capped at 3 per match at the API layer (`/api/messages`), not just the UI.
