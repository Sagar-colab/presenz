import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { sha256, normalisePhoneIN } from "@/lib/utils";

// Credentials provider that consumes a verified OTP attempt.
// /api/otp/verify marks the OtpAttempt row consumed and the User phoneVerified=true,
// then NextAuth signs in by phone.

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    isAdmin?: boolean;
    isBanned?: boolean;
    stamp?: number;
  }
}

// JWT claims for isAdmin/isBanned refresh every 5 minutes (so an admin-side
// ban becomes effective within ~5 min without a full re-sign-in).
const CLAIMS_TTL_MS = 5 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/onboarding" },
  providers: [
    CredentialsProvider({
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        code: { label: "OTP", type: "text" },
      },
      async authorize(creds) {
        if (!creds?.phone || !creds?.code) return null;
        const phone = normalisePhoneIN(creds.phone);
        if (!phone) return null;

        const codeHash = await sha256(creds.code);
        const otp = await prisma.otpAttempt.findFirst({
          where: { phone, codeHash, consumedAt: null, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        });
        if (!otp) return null;

        await prisma.otpAttempt.update({
          where: { id: otp.id },
          data: { consumedAt: new Date() },
        });

        const user = await prisma.user.upsert({
          where: { phone },
          update: { phoneVerified: true },
          create: { phone, phoneVerified: true },
        });
        return { id: user.id, name: user.name ?? null, email: null };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const now = Date.now();
      if (user) {
        token.uid = user.id;
        token.stamp = 0;
      }
      if (token.uid && (!token.stamp || now - token.stamp > CLAIMS_TTL_MS)) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.uid as string },
          select: { isAdmin: true, status: true },
        });
        token.isAdmin = fresh?.isAdmin ?? false;
        token.isBanned = fresh?.status === "BANNED" || fresh?.status === "SUSPENDED";
        token.stamp = now;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) {
        const u = session.user as { id?: string; isAdmin?: boolean; isBanned?: boolean };
        u.id = token.uid as string;
        u.isAdmin = !!token.isAdmin;
        u.isBanned = !!token.isBanned;
      }
      return session;
    },
  },
};
