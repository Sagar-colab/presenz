# 💜 Presenz — Intentional Dating, Built for Real Connections

<p align="center">
  <strong>Meet in person. Or not at all.</strong>
</p>

<p align="center">
  A premium dating platform built around verified identity,
  intentional matching, and meaningful real-world connections.
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)

</p>

---

## 💜 About Presenz

**Presenz** is a premium dating platform designed around a simple idea:

> **Less endless chatting. More meaningful connections in the real world.**

Instead of encouraging unlimited swiping and conversations that never leave the app, Presenz focuses on **verified identities, intentional matching, and limited communication**.

The core experience is built around:

- One match a day
- Three messages
- One real date

The platform combines identity verification, curated matching, profile creation, and controlled communication into a single experience.

---

# ✨ Core Features

## 🔐 Verified Identity

Presenz is designed around identity verification rather than anonymous profiles.

The verification architecture supports:

- 📱 Phone number authentication
- 🔢 OTP-based sign-in
- 🪪 Aadhaar verification flow
- 👤 Face verification
- 🛡️ Identity and profile checks

Third-party verification services can be enabled through environment variables while development uses safe service stubs.

---

## 💜 Intentional Matching

Presenz is designed to encourage quality over quantity.

Instead of unlimited interactions, the product is structured around:

```text
        One Match
            ↓
      Three Messages
            ↓
        Real Date
```

The limited interaction model encourages users to move conversations toward meaningful real-world meetings.

---

## 💬 Limited Messaging

Each match has a controlled messaging experience.

The API layer enforces the messaging limits rather than relying only on frontend restrictions.

This ensures that product rules remain enforced even when requests are made directly against the backend.

---

## 👤 Profile Creation

Users can create profiles with:

- Personal information
- Interests
- Profile photographs
- Verification information
- Matching preferences

The profile flow is designed to collect the information needed for intentional matching.

---

# 🛡️ Verification & Safety Architecture

Presenz integrates multiple verification services through a modular service architecture.

```text
                    User
                      │
                      ▼
              ┌───────────────┐
              │ Phone + OTP   │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Identity      │
              │ Verification  │
              └───────┬───────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
       Aadhaar Check      Face Check
             │                 │
             └────────┬────────┘
                      ▼
              ┌───────────────┐
              │    Profile    │
              │   Creation    │
              └───────┬───────┘
                      │
                      ▼
                  Dashboard
```

Supported integrations include:

- Twilio
- DigiLocker
- AWS Rekognition
- Cloudinary
- Google Vision

Development environments use service stubs, allowing the application to run without requiring every third-party integration.

---

# 🏗️ Architecture

Presenz uses a **Next.js App Router architecture** with PostgreSQL and Prisma on the backend.

```text
                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  ▼
                       ┌────────────────────┐
                       │    Next.js App     │
                       │    Router + UI     │
                       └─────────┬──────────┘
                                 │
                 ┌───────────────┼────────────────┐
                 │               │                │
                 ▼               ▼                ▼
          Authentication     Profiles         Matching
                 │               │                │
                 └───────────────┼────────────────┘
                                 │
                                 ▼
                       ┌────────────────────┐
                       │     API Routes     │
                       └─────────┬──────────┘
                                 │
                                 ▼
                       ┌────────────────────┐
                       │ Prisma ORM         │
                       └─────────┬──────────┘
                                 │
                                 ▼
                       ┌────────────────────┐
                       │    PostgreSQL      │
                       └────────────────────┘
```

---

# 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** | Full-stack web framework |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | UI styling |
| **PostgreSQL** | Relational database |
| **Prisma** | Database ORM |
| **NextAuth** | Authentication |
| **Twilio** | OTP infrastructure |
| **DigiLocker** | Identity verification integration |
| **AWS Rekognition** | Face verification |
| **Google Vision** | Image safety analysis |
| **Cloudinary** | Production image storage |
| **Vercel** | Deployment |

---

# 📂 Project Structure

```text
presenz/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── otp/
│   │   ├── verify/
│   │   └── profile/
│   │
│   ├── onboarding/
│   ├── verify/
│   ├── profile/
│   └── dashboard/
│
├── components/
│   └── UI, landing and onboarding components
│
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── session.ts
│   ├── rate-limit.ts
│   ├── prompts.ts
│   └── services/
│
├── prisma/
│   └── schema.prisma
│
├── mobile/
│   └── Expo React Native application
│
├── next.config.js
├── tailwind.config.ts
├── vercel.json
└── package.json
```

---

# 📱 Mobile Application

Presenz also includes an **Expo / React Native mobile application** that communicates with the existing web backend.

### Mobile Stack

- Expo SDK 54
- React Native 0.81
- Expo Router 6
- Axios
- Expo Secure Store
- Safe Area Context

The mobile authentication flow supports:

```text
Invite Code
     ↓
Phone Number
     ↓
OTP
     ↓
JWT Token
     ↓
Authenticated App
```

The mobile application uses bearer-token authentication while continuing to communicate with the existing Presenz backend.

---

# 🔑 Authentication

The authentication system supports:

- Invite-code validation
- Phone number authentication
- OTP verification
- NextAuth sessions
- Mobile JWT authentication

For mobile clients, authentication tokens are securely stored using **Expo Secure Store**.

The backend supports both:

```text
NextAuth Cookie
       +
Bearer Token
```

allowing the same backend API architecture to serve both web and mobile clients.

---

# 💳 Subscription System

Presenz includes a subscription architecture powered by **Razorpay**.

The payment system supports:

- Subscription creation
- Subscription status
- Subscription cancellation
- Razorpay webhook verification
- Plan management
- Admin plan setup

Webhook signatures are verified using **HMAC SHA-256** before subscription state is updated.

---

# 🧠 Architectural Highlights

### Service Abstraction

Third-party integrations use service factories that can switch between:

```text
Development
    ↓
Service Stub

Production
    ↓
Live Provider
```

This allows the application to be developed and tested without requiring every external service during local development.

---

### 🔒 Server-Side Enforcement

Important product limits are enforced at the API layer rather than relying solely on frontend validation.

Examples include:

- OTP attempt limits
- Profile photo limits
- Prompt selection limits
- Message limits
- Authentication requirements

---

### 🗄️ Database-Backed OTP State

OTP state is stored in PostgreSQL rather than application memory.

This allows OTP state to survive serverless cold starts.

---

### ⚡ Prisma + Node Runtime

API routes use the Node.js runtime because Prisma requires the Node runtime for the database layer.

---

# 🚀 Local Development

## 1. Clone the Repository

```bash
git clone https://github.com/Sagar-colab/presenz.git

cd presenz
```

## 2. Install Dependencies

```bash
pnpm install
```

## 3. Configure Environment Variables

```bash
cp .env.example .env
```

Configure the required variables, including:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

Additional variables can be added for third-party integrations.

---

## 4. Initialize the Database

```bash
pnpm db:push
```

---

## 5. Start the Development Server

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Development Mode

During development, external integrations are stubbed when their environment variables are not configured.

Examples:

```text
OTP
 ↓
Printed to server console

Identity Verification
 ↓
Development Stub

Face Verification
 ↓
Development Stub

Photo Upload
 ↓
Local Storage
```

This allows the core application flow to be developed without requiring production credentials.

---

# ☁️ Deployment

Presenz is configured for deployment on **Vercel**.

The deployment configuration includes:

- Frozen pnpm lockfile installation
- Prisma generation
- Node runtime configuration
- Function memory configuration
- API cache controls
- Security headers
- Production environment configuration

For production image uploads, **Cloudinary** is required because the Vercel filesystem is read-only at runtime.

---

# 🔮 Future Development

Potential areas for further development include:

- [ ] Real-time chat experience
- [ ] Advanced matching algorithms
- [ ] Production-grade rate limiting with Redis
- [ ] Enhanced identity verification
- [ ] Push notification workflows
- [ ] Mobile dashboard and matching experience
- [ ] Biometric authentication
- [ ] Advanced recommendation system
- [ ] Analytics and observability
- [ ] Expanded subscription features

---

# 📌 Product Philosophy

Presenz is built around a simple product philosophy:

```text
Less Swiping
     ↓
More Intentional Matching
     ↓
Less Endless Chatting
     ↓
More Real Conversations
     ↓
More Real-World Connections
```

The product focuses on creating a dating experience where **meeting someone in person is the destination, not an afterthought.**

---

# 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for details.

---

<div align="center">

## 💜 Presenz

**Meet in person. Or not at all.**

Built with **Next.js • TypeScript • PostgreSQL • Prisma**

### Created by **Sagar U.**

⭐ If you find this project interesting, consider giving it a star.

</div>
