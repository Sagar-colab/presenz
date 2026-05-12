import { prisma } from "@/lib/db";

// Expo Push API client. Sends to https://exp.host/--/api/v2/push/send.
// Used (eventually) by match-created, proposal-received, chat-message,
// 24hr-before-date, and date-confirmed events. Mobile app calls
// /api/push/register on first launch to enroll its Expo token.

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string | number | boolean>;
  sound?: "default";
  priority?: "default" | "high";
};

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

export async function sendPush(
  userId: string,
  notification: { title: string; body: string; data?: Record<string, string | number | boolean> },
): Promise<{ sent: number; failed: number }> {
  const tokens = await prisma.pushToken.findMany({
    where: { userId },
    select: { token: true },
  });
  if (tokens.length === 0) return { sent: 0, failed: 0 };

  const messages: ExpoPushMessage[] = tokens.map((t) => ({
    to: t.token,
    title: notification.title,
    body: notification.body,
    data: notification.data,
    sound: "default",
    priority: "high",
  }));

  try {
    const res = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // Expo accepts unauthenticated requests with Expo tokens; bearer is
        // optional for higher rate limits.
      },
      body: JSON.stringify(messages),
    });
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error(`[push] expo push HTTP ${res.status} userId=${userId}`);
      return { sent: 0, failed: messages.length };
    }
    return { sent: messages.length, failed: 0 };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[push] expo push throw userId=${userId}`, err);
    return { sent: 0, failed: messages.length };
  }
}
