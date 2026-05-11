// Twilio SMS interface. In dev (no TWILIO_* envs), prints OTP to the server console.
// In prod, uses the official Twilio SDK to send real SMS.

import type { Twilio } from "twilio";

export interface SmsService {
  sendOtp(toE164: string, code: string): Promise<{ ok: true } | { ok: false; reason: string }>;
}

let twilioClient: Twilio | null = null;

async function getTwilioClient(): Promise<Twilio> {
  if (twilioClient) return twilioClient;
  const { default: twilio } = await import("twilio");
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  return twilioClient;
}

class TwilioSmsService implements SmsService {
  async sendOtp(toE164: string, code: string) {
    try {
      const client = await getTwilioClient();
      await client.messages.create({
        to: toE164,
        from: process.env.TWILIO_FROM_NUMBER!,
        body: `Your Presenz code is ${code}. It expires in 10 minutes.`,
      });
      return { ok: true as const };
    } catch (err) {
      const reason = err instanceof Error ? err.message : "twilio error";
      return { ok: false as const, reason };
    }
  }
}

class StubSmsService implements SmsService {
  async sendOtp(toE164: string, code: string) {
    // eslint-disable-next-line no-console
    console.log(`[stub-sms] → ${toE164}  OTP: ${code}`);
    return { ok: true as const };
  }
}

export function getSmsService(): SmsService {
  const live =
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER;
  return live ? new TwilioSmsService() : new StubSmsService();
}
