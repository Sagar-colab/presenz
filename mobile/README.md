# Presenz — mobile

Expo (managed workflow) React Native app for iOS and Android. Lives inside the Presenz monorepo at `mobile/`, talks to the live web backend at `https://presenz-opal.vercel.app` via bearer-token auth.

## What ships in Phase 5b (this commit)

- Expo SDK 54, React Native 0.81, Expo Router 6
- Bundle id `com.presenz.app`, app name "Presenz"
- Theme tokens mirroring the web (primary `#534AB7`, surface/ink/line palette)
- `src/lib/api.ts` — axios instance with auto-attached bearer from secure-store
- `src/lib/auth.ts` — `sendOtp` / `checkInvite` / `signInWithOtp` / `signOut`
- `src/lib/storage.ts` — `expo-secure-store` wrapper for the JWT
- Auth stack: `invite → phone → otp` → tabs home placeholder
- `eas.json` with development / preview / production profiles

## What's NOT here yet

- Tab screens (home/proposals/chat/profile/settings) — Phase 5d
- Aadhaar + face-scan + profile creation — Phase 5c
- Biometrics, push notifications, haptics — Phase 5e
- Custom Inter font (uses platform sans default for now)
- Real app icon / splash artwork (placeholders only)
- Razorpay deep-link wiring — Phase 5e

## Local dev

```bash
cd mobile
npm install
npx expo start          # then scan QR with Expo Go on phone
```

Defaults to the live backend. To point at a local Next.js server, set `EXPO_PUBLIC_API_BASE_URL=http://<your-LAN-ip>:3000` before `npx expo start`.

## EAS setup (one-time, per developer)

```bash
cd mobile
npx eas-cli login                # uses your Expo account
npx eas-cli init                 # writes the project's eas.json projectId
npx eas-cli build --profile development --platform ios     # first dev build
```

`eas.json` is ready — you only need to log in and run `init` to claim the slug `presenz` under your Expo account. Push notification credentials (Apple p8, FCM service-account JSON) are configured later via `eas credentials`.

## Backend coupling

- `POST /api/auth/mobile-signin` — phone+OTP → `{ token, user }`. Token is HS256-signed with `NEXTAUTH_SECRET`, 30-day TTL.
- `POST /api/push/register` — register Expo push token (used from Phase 5e onward).
- Every other `/api/*` route works as-is — `lib/session.ts requireUserId()` on the backend accepts `Authorization: Bearer` in addition to NextAuth cookies.

## Design system source of truth

Web (`tailwind.config.ts` + CSS variables) is canonical. Tokens here are duplicated by design — no shared package yet. Keep `src/theme/colors.ts` in sync when you change web colours.
