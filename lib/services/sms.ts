// Twilio SMS interface. In dev, prints OTP to the server console.
// To go live: fill TWILIO_* envs and the real branch will activate automatically.

export interface SmsService {
  sendOtp(toE164: string, code: string): Promise<{ ok: true } | { ok: false; reason: string }>;
}

class TwilioSmsService implements SmsService {
  async sendOtp(toE164: string, code: string) {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const token = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_FROM_NUMBER!;
    const body = `Your Présenz code is ${code}. It expires in 10 minutes.`;
    const params = new URLSearchParams({ To: toE164, From: from, Body: body });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const reason = await res.text().catch(() => "twilio error");
      return { ok: false as const, reason };
    }
    return { ok: true as const };
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
  const live = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER;
  return live ? new TwilioSmsService() : new StubSmsService();
}
