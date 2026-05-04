import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { sha256, normalisePhoneIN } from "@/lib/utils";

// Credentials provider that consumes a verified OTP attempt.
// /api/otp/verify marks the OtpAttempt row consumed and the User phoneVerified=true,
// then NextAuth signs in by phone.

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
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) {
        (session.user as { id?: string }).id = token.uid as string;
      }
      return session;
    },
  },
};
