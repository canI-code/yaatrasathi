import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon, PaperAirplaneIcon, PlusIcon,
  ChatBubbleLeftRightIcon, TrashIcon,
} from "@heroicons/react/24/outline";
import { sendGeneralChatMessage } from "../../lib/groq";
import type { ChatMessage } from "../../lib/groq";
import { useSubscription } from "../../contexts/SubscriptionContext";
import { colors } from "../../theme";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "yatrasathi_general_chats";

// ── Persistence ───────────────────────────────────────────────────────────────

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch { return []; }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function newSession(): ChatSession {
  return { id: `chat_${Date.now()}`, title: "New Chat", messages: [], createdAt: Date.now(), updatedAt: Date.now() };
}

// ── Inline bold parser ────────────────────────────────────────────────────────

function parseInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, j) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={j} style={{ color: colors.textMain, fontWeight: 700 }}>{part.slice(2, -2)}</strong>
          : part
      )}
    </>
  );
}

// ── Message renderer ──────────────────────────────────────────────────────────

function renderMessageContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let kvItems: { key: string; value: string }[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`list_${elements.length}`} style={{ margin: "6px 0", paddingLeft: 0, listStyle: "none" }}>
        {listItems.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 8, marginBottom: 5, fontSize: "0.83rem", color: colors.textBody, lineHeight: 1.55, wordBreak: "break-word" }}>
            <span style={{ color: colors.accentStrong, flexShrink: 0, marginTop: 2, fontSize: "0.7rem" }}>●</span>
            <span style={{ flex: 1 }}>{item}</span>
          </li>
        ))}
      </ul>
    );
    listItems = [];
  }

  function flushKV() {
    if (kvItems.length === 0) return;
    elements.push(
      <div key={`kv_${elements.length}`} style={{ margin: "6px 0", borderRadius: 10, border: "1px solid rgba(164,216,225,0.25)", overflow: "hidden" }}>
        {kvItems.map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 12px", background: i % 2 === 0 ? "rgba(248,250,252,0.8)" : "rgba(255,255,255,0.6)", borderBottom: i < kvItems.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: colors.textSubtle, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.key}</span>
            <span style={{ fontSize: "0.84rem", color: colors.textBody, wordBreak: "break-word", lineHeight: 1.5 }}>{parseInlineBold(item.value)}</span>
          </div>
        ))}
      </div>
    );
    kvItems = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      flushList(); flushKV();
      elements.push(
        <p key={i} style={{ margin: "10px 0 4px", fontSize: "0.75rem", fontWeight: 700, color: colors.textMain, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {line.slice(3)}
        </p>
      );
    } else if (line.startsWith("- ")) {
      flushKV();
      listItems.push(parseInlineBold(line.slice(2)));
    } else if (line.startsWith("⚠️")) {
      flushList(); flushKV();
      const text = line.replace(/^⚠️\s*/, "");
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, padding: "8px 12px", background: "rgba(249,115,22,0.08)", borderRadius: 10, border: "1px solid rgba(249,115,22,0.2)", margin: "4px 0" }}>
          <span style={{ flexShrink: 0, fontSize: "0.9rem" }}>⚠️</span>
          <p style={{ margin: 0, fontSize: "0.82rem", color: colors.warning, lineHeight: 1.5, wordBreak: "break-word" }}>{parseInlineBold(text)}</p>
        </div>
      );
    } else if (line.startsWith("💡")) {
      flushList(); flushKV();
      const text = line.replace(/^💡\s*/, "");
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, padding: "8px 12px", background: "rgba(42,157,143,0.06)", borderRadius: 10, border: "1px solid rgba(42,157,143,0.15)", margin: "4px 0" }}>
          <span style={{ flexShrink: 0, fontSize: "0.9rem" }}>💡</span>
          <p style={{ margin: 0, fontSize: "0.82rem", color: colors.accentStrong, lineHeight: 1.5, wordBreak: "break-word" }}>{parseInlineBold(text)}</p>
        </div>
      );
    } else if (/^\*\*[^*]+:\*\*/.test(line)) {
      flushList();
      const match = line.match(/^\*\*([^*]+):\*\*\s*(.*)/);
      if (match) {
        kvItems.push({ key: match[1], value: match[2] });
      }
    } else if (line.trim() === "") {
      flushList(); flushKV();
    } else {
      flushList(); flushKV();
      elements.push(
        <p key={i} style={{ margin: "3px 0", fontSize: "0.84rem", color: colors.textBody, lineHeight: 1.65, wordBreak: "break-word" }}>
          {parseInlineBold(line)}
        </p>
      );
    }
  }
  flushList(); flushKV();
  return elements;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GeneralChat() {
  const { canUse, hasChatQuota, incrementChatUsage } = useSubscription();
  const [open, setOpen] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [activeId, setActiveId] = useState<string>(() => {
    const s = loadSessions();
    return s.length > 0 ? s[0].id : newSession().id;
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure there's always at least one session
  useEffect(() => {
    if (sessions.length === 0) {
      const s = newSession();
      setSessions([s]);
      setActiveId(s.id);
    }
  }, [sessions.length]);

  // Persist on change
  useEffect(() => { saveSessions(sessions); }, [sessions]);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [sessions, loading]);

  // Focus input when opened
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const activeSession = sessions.find((s) => s.id === activeId) ?? sessions[0];

  const createNewChat = useCallback(() => {
    const s = newSession();
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    setShowSessions(false);
    setError(null);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (next.length === 0) {
        const s = newSession();
        setActiveId(s.id);
        return [s];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }, [activeId]);

  async function handleSend() {
    const msg = input.trim();
    if (!msg || loading || !activeSession) return;

    // Check feature access and quota
    if (!canUse('canUseGeneralChat') || !hasChatQuota()) {
      setError(!canUse('canUseGeneralChat')
        ? "General Chat requires Basic or Pro plan. Visit /pricing to upgrade."
        : "Daily chat limit reached. Upgrade to Pro for unlimited messages.");
      return;
    }
    await incrementChatUsage();
    setInput("");
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: msg };
    const updatedMessages = [...activeSession.messages, userMsg];

    // Update title from first message
    const isFirst = activeSession.messages.length === 0;
    const newTitle = isFirst ? msg.slice(0, 40) + (msg.length > 40 ? "…" : "") : activeSession.title;

    setSessions((prev) => prev.map((s) =>
      s.id === activeId ? { ...s, messages: updatedMessages, title: newTitle, updatedAt: Date.now() } : s
    ));

    setLoading(true);
    try {
      const reply = await sendGeneralChatMessage(activeSession.messages, msg);
      const aiMsg: ChatMessage = { role: "assistant", content: reply };
      setSessions((prev) => prev.map((s) =>
        s.id === activeId ? { ...s, messages: [...updatedMessages, aiMsg], updatedAt: Date.now() } : s
      ));
    } catch {
      setError("Failed to get a response. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop (mobile) */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 1998, background: "rgba(0,0,0,0.15)" }}
            className="chat-backdrop-mobile"
          />

          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              position: "fixed", bottom: 80, right: 16, zIndex: 1999,
              width: "min(420px, calc(100vw - 32px))",
              height: "min(600px, calc(100vh - 120px))",
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              borderRadius: 20, border: "1px solid rgba(164,216,225,0.35)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: colors.accentStrong, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ChatBubbleLeftRightIcon style={{ width: 16, height: 16, color: "#fff" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: colors.textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {activeSession?.title ?? "YatraSathi Chat"}
                </p>
                <p style={{ margin: 0, fontSize: "0.68rem", color: colors.textSubtle }}>AI Travel Assistant</p>
              </div>
              <button onClick={() => setShowSessions((v) => !v)} title="Chat history"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: colors.textMuted, padding: 4, display: "flex", alignItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              </button>
              <button onClick={createNewChat} title="New chat"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: colors.textMuted, padding: 4, display: "flex", alignItems: "center" }}>
                <PlusIcon style={{ width: 16, height: 16 }} />
              </button>
              <button onClick={() => setOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: colors.textMuted, padding: 4, display: "flex", alignItems: "center" }}>
                <XMarkIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Session list */}
            <AnimatePresence>
              {showSessions && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                  style={{ overflow: "hidden", borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0 }}>
                  <div style={{ maxHeight: 200, overflowY: "auto", padding: "8px" }}>
                    {sessions.map((s) => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 10, background: s.id === activeId ? "rgba(42,157,143,0.08)" : "transparent", cursor: "pointer", marginBottom: 2 }}
                        onClick={() => { setActiveId(s.id); setShowSessions(false); }}>
                        <ChatBubbleLeftRightIcon style={{ width: 13, height: 13, color: s.id === activeId ? colors.accentStrong : colors.textSubtle, flexShrink: 0 }} />
                        <p style={{ margin: 0, flex: 1, fontSize: "0.8rem", color: s.id === activeId ? colors.accentStrong : colors.textBody, fontWeight: s.id === activeId ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {s.title}
                        </p>
                        <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: colors.textSubtle, padding: 2, display: "flex", flexShrink: 0 }}>
                          <TrashIcon style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "thin", scrollbarColor: "rgba(42,157,143,0.2) transparent" }}>
              {(!activeSession || activeSession.messages.length === 0) && !loading && (
                <div style={{ margin: "auto", textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: "1.8rem", margin: "0 0 8px" }}>✈️</p>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: colors.textMain, margin: "0 0 4px" }}>YatraSathi General Chat</p>
                  <p style={{ fontSize: "0.78rem", color: colors.textSubtle, margin: 0 }}>Ask anything about travel, destinations, tips, or general knowledge.</p>
                </div>
              )}

              {activeSession?.messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: colors.accentStrong, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                      <ChatBubbleLeftRightIcon style={{ width: 13, height: 13, color: "#fff" }} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: "88%",
                    padding: msg.role === "user" ? "9px 14px" : "10px 14px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? colors.accentStrong : "rgba(248,250,252,0.95)",
                    color: msg.role === "user" ? "#fff" : colors.textBody,
                    border: msg.role === "assistant" ? "1px solid rgba(164,216,225,0.25)" : "none",
                    fontSize: "0.85rem", lineHeight: 1.6,
                    wordBreak: "break-word", overflowWrap: "break-word", minWidth: 0,
                  }}>
                    {msg.role === "user"
                      ? <p style={{ margin: 0 }}>{msg.content}</p>
                      : <div>{renderMessageContent(msg.content)}</div>
                    }
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: colors.accentStrong, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ChatBubbleLeftRightIcon style={{ width: 13, height: 13, color: "#fff" }} />
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: "rgba(248,250,252,0.9)", border: "1px solid rgba(164,216,225,0.25)", display: "flex", gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: colors.textSubtle, display: "inline-block" }} />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p style={{ margin: 0, fontSize: "0.78rem", color: colors.error, background: colors.errorSoft, borderRadius: 8, padding: "7px 12px" }}>{error}</p>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: 8, flexShrink: 0 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask anything about travel..."
                disabled={loading}
                style={{ flex: 1, padding: "9px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontFamily: "Inter,sans-serif", color: colors.textMain, outline: "none" }}
              />
              <button onClick={handleSend} disabled={loading || !input.trim()}
                style={{ width: 38, height: 38, borderRadius: 12, border: "none", background: loading || !input.trim() ? "rgba(42,157,143,0.3)" : colors.accentStrong, color: "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <PaperAirplaneIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed", bottom: 20, right: 16, zIndex: 1997,
          width: 52, height: 52, borderRadius: "50%",
          background: open ? colors.textMain : colors.accentStrong,
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(42,157,143,0.4)",
          transition: "background 0.2s",
        }}
        title="YatraSathi Chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? "close" : "chat"} initial={{ opacity: 0, rotate: -10, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 10, scale: 0.8 }} transition={{ duration: 0.15 }}>
            {open
              ? <XMarkIcon style={{ width: 22, height: 22, color: "#fff" }} />
              : <ChatBubbleLeftRightIcon style={{ width: 22, height: 22, color: "#fff" }} />
            }
          </motion.span>
        </AnimatePresence>
        {/* Unread dot — show when closed and has messages */}
        {!open && sessions.some((s) => s.messages.length > 0) && (
          <span style={{ position: "absolute", top: 6, right: 6, width: 10, height: 10, borderRadius: "50%", background: "#f97316", border: "2px solid #fff" }} />
        )}
      </motion.button>

      {createPortal(panel, document.body)}

      <style>{`
        @media (min-width: 640px) { .chat-backdrop-mobile { display: none !important; } }
      `}</style>
    </>
  );
}
