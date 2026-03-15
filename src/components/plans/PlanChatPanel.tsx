import { useState, useRef, useEffect, FormEvent } from "react";
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { sendPlanChatMessage, type ChatMessage } from "../../lib/groq";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { UPGRADE_MESSAGES } from "../../lib/planLimits";
import type { PlanSection } from "../../types";
import { colors, glass } from "../../theme";

interface PlanChatPanelProps {
  sections: PlanSection[];
}

export default function PlanChatPanel({ sections }: PlanChatPanelProps) {
  const { canUse } = useSubscription();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: msg };
    setHistory((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await sendPlanChatMessage(sections, [...history, userMsg], msg);
      setHistory((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setError("Failed to get a response. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!canUse('canUsePlanChat')) {
    return (
      <div style={{ padding: "14px 16px", background: "rgba(42,157,143,0.04)", borderRadius: 12, border: "1px dashed rgba(42,157,143,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: "0.85rem", color: colors.textMuted }}>Plan Chat requires Basic or Pro plan.</p>
        <a href="/pricing" style={{ fontSize: "0.78rem", fontWeight: 700, color: colors.accentStrong, textDecoration: "none", background: "rgba(42,157,143,0.08)", padding: "4px 12px", borderRadius: 999 }}>Upgrade</a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* No sections hint — Req 6.4 */}
      {sections.length === 0 && (
        <div
          style={{
            ...glass.subtle,
            padding: "12px 16px",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ChatBubbleLeftRightIcon
            style={{ width: 15, height: 15, color: colors.textSubtle, flexShrink: 0 }}
          />
          <p style={{ margin: 0, fontSize: "0.82rem", color: colors.textMuted }}>
            Saving plan sections will give the AI more context for better answers.
          </p>
        </div>
      )}

      {/* Message history */}
      <div
        style={{
          minHeight: 200,
          maxHeight: 400,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "4px 0 12px",
        }}
      >
        {history.length === 0 && !loading && (
          <p
            style={{
              margin: "auto",
              fontSize: "0.85rem",
              color: colors.textSubtle,
              textAlign: "center",
              padding: "24px 0",
            }}
          >
            Ask anything about your plan…
          </p>
        )}

        <AnimatePresence initial={false}>
          {history.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background:
                    msg.role === "user"
                      ? colors.accentStrong
                      : "rgba(255,255,255,0.7)",
                  color: msg.role === "user" ? "#ffffff" : colors.textBody,
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  border:
                    msg.role === "assistant"
                      ? `1px solid rgba(164,216,225,0.3)`
                      : "none",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "16px 16px 16px 4px",
                background: "rgba(255,255,255,0.7)",
                border: `1px solid rgba(164,216,225,0.3)`,
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: colors.textSubtle,
                    display: "inline-block",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <p
          style={{
            margin: "0 0 8px",
            fontSize: "0.8rem",
            color: colors.error,
            background: colors.errorSoft,
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          {error}
        </p>
      )}

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          gap: 8,
          borderTop: `1px solid rgba(164,216,225,0.2)`,
          paddingTop: 12,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your plan…"
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 12,
            border: `1px solid rgba(0,0,0,0.08)`,
            background: "rgba(255,255,255,0.5)",
            fontSize: "0.88rem",
            fontFamily: "Inter, sans-serif",
            color: colors.textMain,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "none",
            background: colors.accentStrong,
            color: "#ffffff",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <PaperAirplaneIcon style={{ width: 16, height: 16 }} />
        </button>
      </form>
    </div>
  );
}
