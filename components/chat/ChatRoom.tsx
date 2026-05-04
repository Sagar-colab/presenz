"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

const MAX = 3;

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export function ChatRoom({
  matchId,
  meId,
  meName,
  mePhoto,
  otherName,
  otherPhoto,
  initialMessages,
}: {
  matchId: string;
  meId: string;
  meName: string;
  mePhoto: string | null;
  otherName: string;
  otherPhoto: string | null;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const used = messages.length;
  const remaining = Math.max(0, MAX - used);
  const locked = used >= MAX;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function send() {
    const content = draft.trim();
    if (!content || locked) return;
    setSending(true);
    setError(null);
    try {
      const r = await fetch(`/api/chat/${matchId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(prettyReason(j.reason ?? "unknown"));
        return;
      }
      setMessages((m) => [...m, j.message as Message]);
      setDraft("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col rounded-2xl bg-white hairline">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-surface-line px-4 py-3 md:px-5">
        <Avatar name={otherName} photo={otherPhoto} size="sm" />
        <div className="flex-1">
          <p className="text-[14.5px] font-medium text-ink">{otherName}</p>
          <p className="text-[12px] text-ink-faint">
            {locked ? "Chat locked" : `${used} of ${MAX} messages used`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 px-4 py-5 md:px-5">
        {messages.length === 0 ? (
          <p className="text-center text-[13.5px] text-ink-muted">
            Say hello — three messages, then meet.
          </p>
        ) : (
          messages.map((m) => (
            <Bubble
              key={m.id}
              mine={m.senderId === meId}
              name={m.senderId === meId ? meName : otherName}
              photo={m.senderId === meId ? mePhoto : otherPhoto}
              content={m.content}
            />
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-surface-line px-4 py-3 md:px-5">
        {locked ? (
          <p className="py-2 text-center text-[14px] text-ink-muted">
            Chat locked — see you there <span aria-hidden>👋</span>
          </p>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${otherName}…`}
              maxLength={800}
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              className="min-h-[44px] flex-1 resize-none rounded-xl bg-surface-alt px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={send}
              disabled={sending || draft.trim().length === 0}
              className="inline-flex h-11 items-center rounded-xl bg-primary px-4 text-[14px] font-medium text-white transition-all duration-150 hover:bg-primary-600 active:scale-[0.97] disabled:opacity-60"
            >
              {sending ? "…" : "Send"}
            </button>
          </div>
        )}
        {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}
        {!locked && (
          <p className="mt-2 text-center text-[11.5px] uppercase tracking-[0.16em] text-ink-faint">
            {remaining} {remaining === 1 ? "message" : "messages"} left
          </p>
        )}
      </div>
    </div>
  );
}

function Bubble({
  mine,
  name,
  photo,
  content,
}: {
  mine: boolean;
  name: string;
  photo: string | null;
  content: string;
}) {
  return (
    <div className={cn("flex items-end gap-2 fade-up", mine && "flex-row-reverse")}>
      <Avatar name={name} photo={photo} size="sm" />
      <div className={cn("max-w-[78%]", mine ? "items-end" : "items-start")}>
        <p
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed",
            mine ? "bg-primary text-white" : "bg-surface-alt text-ink",
          )}
        >
          {content}
        </p>
      </div>
    </div>
  );
}

function prettyReason(r: string) {
  const map: Record<string, string> = {
    max_messages_reached: "You've used all three messages. Time to meet.",
    chat_not_open: "Chat isn't open yet.",
    rate_limited: "Slow down a moment.",
  };
  return map[r] ?? "Couldn't send that. Try again.";
}
