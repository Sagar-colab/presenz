# Présenz

> Meet in person. Or not at all.

A premium dating app built around verified identity, intentional matching, and limited messaging — one match a day, three messages, then meet.

## Stack

- **Next.js 14** (app router) · TypeScript strict
- **Tailwind CSS** · Inter · primary `#534AB7`
- **PostgreSQL + Prisma**
- **NextAuth** (Credentials provider, phone OTP)
- Service stubs for **Twilio**, **DigiLocker**, **AWS Rekognition**, **Cloudinary**, **Google Vision** — swap to live by setting env vars

## Local quick start

```bash
pnpm install
cp .env.example .env
# edit DATABASE_URL and run: openssl rand -base64 32 → paste into NEXTAUTH_SECRET
pnpm db:push
pnpm dev
```

In dev, all third-party integrations are stubbed:
- OTPs print to the server console (look for `[stub-sms] → +91… OTP: 123456`)
- Aadhaar / face / NSFW checks return success after a short delay
- Photo uploads write to `public/uploads/`

---

## Deploying to Vercel

Présenz is configured to deploy to Vercel out of the box (`vercel.json`, frozen-lockfile install, Mumbai region, Prisma generate in build, function memory tuned for image-processing routes).

### One-time prerequisites

You need:
1. A **GitHub** account (free)
2. A **Vercel** account (free, sign up with the GitHub account)
3. A **Postgres** database accessible from the public internet — easiest options are:
   - [**Vercel Postgres**](https://vercel.com/storage/postgres) (one click, integrated)
   - [**Neon**](https://neon.tech) (serverless, generous free tier)
   - [**Supabase**](https://supabase.com) (managed Postgres, free tier)
   - [**Railway**](https://railway.app) (paid)

### Step 1 — Push to GitHub

You have two options.

#### Option A — GitHub CLI (one-liner)

If you have the [`gh` CLI](https://cli.github.com/) installed and authenticated:

```bash
cd /Users/akhilganatra/presenz
gh repo create presenz --private --source=. --remote=origin --push
```

This creates the repo, sets the remote, and pushes `main` in one command.

#### Option B — Web UI

1. Go to https://github.com/new
2. Repository name: `presenz`. Visibility: **Private** (you can flip later).
3. **Do not** tick "add a README", "add .gitignore", or "add license" — we already have those locally.
4. Click **Create repository**. Copy the `git@github.com:USER/presenz.git` URL.
5. From your terminal:
   ```bash
   cd /Users/akhilganatra/presenz
   git remote add origin git@github.com:USER/presenz.git
   git branch -M main
   git push -u origin main
   ```

### Step 2 — Apply the schema to your production database

You need to run this **once** before the first deploy, against the prod DB:

```bash
# from your local machine, with your production DATABASE_URL exported
DATABASE_URL="postgresql://...prod..." pnpm prisma db push
```

(For ongoing work you'll graduate to `prisma migrate dev` + `prisma migrate deploy`. For first deploy, `db push` is fine.)

### Step 3 — Connect to Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository** and pick `presenz`. (Authorise Vercel to read the repo if it's the first time.)
3. **Framework Preset**: Vercel will auto-detect **Next.js**. Leave it.
4. **Root Directory**: leave blank (project is at the root).
5. **Build & Output Settings**: leave defaults — `vercel.json` overrides them with the correct Prisma+Next build command.
6. **Install Command**: leave default — `vercel.json` sets `pnpm install --frozen-lockfile`.
7. **Don't click Deploy yet.** Open the **Environment Variables** section first.

### Step 4 — Add environment variables in the Vercel dashboard

In the **Environment Variables** panel during the import flow (or later, under **Project → Settings → Environment Variables**), add the following. For each one, select **Production**, **Preview**, and **Development** unless noted otherwise.

| Key | Value | Required |
|---|---|---|
| `DATABASE_URL` | Your production Postgres URL | **Yes** |
| `NEXTAUTH_SECRET` | Output of `openssl rand -base64 32` (use a different value per env) | **Yes** |
| `NEXTAUTH_URL` | `https://your-vercel-domain.vercel.app` (or your custom domain) | **Yes** |
| `TWILIO_ACCOUNT_SID` | From Twilio console | Optional — stub used if blank |
| `TWILIO_AUTH_TOKEN` | From Twilio console | Optional |
| `TWILIO_FROM_NUMBER` | E.164, e.g. `+14155552671` | Optional |
| `DIGILOCKER_CLIENT_ID` | From your Aadhaar provider | Optional — stub used if blank |
| `DIGILOCKER_CLIENT_SECRET` | From your Aadhaar provider | Optional |
| `AWS_REGION` | e.g. `ap-south-1` | Required if using Rekognition |
| `AWS_ACCESS_KEY_ID` | IAM key with Rekognition permission | Optional — stub used if blank |
| `AWS_SECRET_ACCESS_KEY` | IAM secret | Optional |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard | **Yes for prod uploads** |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard | **Yes for prod uploads** |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard | **Yes for prod uploads** |
| `GOOGLE_VISION_API_KEY` | From GCP console | Optional — stub used if blank |

> **Why Cloudinary is required in prod:** Vercel's filesystem is read-only at runtime, so the dev fallback that writes to `public/uploads/` will fail. Set the three Cloudinary keys before any user uploads a photo on a live deploy.

> **Tip:** If you've already filled `.env` locally, you can paste it into the Vercel dashboard via **Settings → Environment Variables → Import .env** to add many keys at once.

### Step 5 — Deploy

Click **Deploy**. The first build takes ~2 minutes (install + Prisma generate + Next build). You'll get a URL like `https://presenz-xxx.vercel.app`.

Every push to `main` ships to production. Every push to any other branch creates a preview deployment with its own URL.

### Step 6 — (Optional) Custom domain

**Project → Settings → Domains → Add**. Vercel will give you DNS records to point at. Once the domain is live, update `NEXTAUTH_URL` in Vercel env vars to the custom domain, then redeploy.

---

## Folder structure

```
presenz/
  app/                 # pages + route handlers
    api/
      auth/[...nextauth]/route.ts
      otp/{send,verify}/route.ts
      verify/{aadhaar,face}/route.ts
      profile/{route.ts, photo/route.ts}
    onboarding/page.tsx
    verify/{aadhaar, face}/page.tsx
    profile/create/page.tsx
    dashboard/page.tsx
  components/          # UI primitives + landing + onboarding
  lib/
    db.ts              # Prisma singleton
    auth.ts            # NextAuth credentials provider
    rate-limit.ts      # in-memory token bucket
    services/          # Twilio / DigiLocker / Rekognition / Vision / upload — stubs + live
    prompts.ts         # 12 prompts + interest tags
    utils.ts session.ts
  prisma/schema.prisma
  vercel.json next.config.js tailwind.config.ts
```

## Architectural notes

- **Service stubs swap to live by env presence.** Each integration in `lib/services/*` exports a `getXService()` factory that returns the live implementation when its keys are set, otherwise the stub. Zero UI changes to go live.
- **Hard caps live at the API layer.** OTP attempts (3), photo count (3–6), 4-of-12 prompts, the 3-message-per-match cap (next-turn) are all enforced server-side via Zod + Prisma, not just UI.
- **Rate limiting is in-process.** `lib/rate-limit.ts` is a single-process token bucket — fine for a single Vercel function instance, but **swap for Upstash Redis (`@upstash/ratelimit`) before scaling**, otherwise each function invocation gets its own bucket.
- **OTP state is in the DB, not memory.** Survives serverless cold starts.
- **Prisma client uses the Node runtime.** All API routes use the default Node runtime (not edge) because Prisma needs it.

## Going live checklist

Before flipping to real users:

- [ ] Replace in-process rate limiter with Upstash Redis
- [ ] Add `prisma migrate dev` workflow + `prisma migrate deploy` to `buildCommand`
- [ ] Set `CLOUDINARY_*` (Vercel filesystem is read-only)
- [ ] Set `TWILIO_*` (real OTP delivery)
- [ ] Wire real Aadhaar provider (Karza / Signzy / DigiLocker partner)
- [ ] Set `AWS_*` for Rekognition liveness + match
- [ ] Set `GOOGLE_VISION_API_KEY` for SafeSearch
- [ ] Add Sentry / observability
- [ ] Enable Vercel Web Analytics
- [ ] Add a backup schedule on the production database
