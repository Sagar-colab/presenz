// Twilio SMS interface. In dev (no TWILIO_* envs), prints OTP to the server console.
// In prod, uses the official Twilio SDK to send real SMS.

import type { Twilio } from "twilio";

export interface SmsService {
  sendOtp(toE164: string, code: string): Promise<{ ok: true } | { ok: false; reason: string }>;
  sendWarning(toE164: string, reason: string): Promise<{ ok: true } | { ok: false; reason: string }>;
}

let twilioClient: Twilio | null = null;

async function getTwilioClient(): Promise<Twilio> {
  if (twilioClient) return twilioClient;
  const { default: twilio } = await import("twilio");
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  return twilioClient;
}

function maskPhone(e164: string): string {
  return e164.length > 4 ? `${e164.slice(0, 3)}***${e164.slice(-4)}` : "***";
}

class TwilioSmsService implements SmsService {
  private async send(toE164: string, body: string, kind: string) {
    const from = process.env.TWILIO_FROM_NUMBER!;
    try {
      const client = await getTwilioClient();
      const msg = await client.messages.create({ to: toE164, from, body });
      // eslint-disable-next-line no-console
      console.log(
        `[sms] sent kind=${kind} sid=${msg.sid} to=${maskPhone(toE164)} from=${from} status=${msg.status}`,
      );
      return { ok: true as const };
    } catch (err) {
      const e = err as { code?: number | string; status?: number; message?: string; moreInfo?: string };
      // eslint-disable-next-line no-console
      console.error(
        `[sms] twilio_error kind=${kind} to=${maskPhone(toE164)} from=${from} code=${e.code ?? "?"} status=${e.status ?? "?"} message="${e.message ?? "?"}" moreInfo=${e.moreInfo ?? "?"}`,
      );
      return { ok: false as const, reason: `twilio_${e.code ?? "error"}:${e.message ?? "unknown"}` };
    }
  }

  async sendOtp(toE164: string, code: string) {
    return this.send(toE164, `Your Presenz code is ${code}. It expires in 10 minutes.`, "otp");
  }

  async sendWarning(toE164: string, reason: string) {
    return this.send(
      toE164,
      `Your Presenz account has received a warning for ${reason}. Repeated violations may result in suspension.`,
      "warning",
    );
  }
}

class StubSmsService implements SmsService {
  async sendOtp(toE164: string, code: string) {
    // eslint-disable-next-line no-console
    console.log(`[stub-sms] → ${toE164}  OTP: ${code}`);
    return { ok: true as const };
  }
  async sendWarning(toE164: string, reason: string) {
    // eslint-disable-next-line no-console
    console.log(`[stub-sms] → ${toE164}  WARNING: ${reason}`);
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
