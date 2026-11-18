import { FormEvent, Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { MdAutoAwesome, MdClose, MdSend } from "react-icons/md";
import { useExperience } from "../../context/ExperienceProvider";
import { SUGGESTED_QUESTIONS } from "../../data/knowledge";
import { answerLocally } from "../../utils/localBot";

type Msg = { role: "user" | "assistant"; content: string };
type Backend = "unknown" | "claude" | "local";

const STORE = "yj:chat";
const BACKEND_KEY = "yj:chat-backend";

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi, I'm Yug's assistant. I answer from his resume only, so ask away: projects, skills, his internship, or how to reach him.",
};

/* ---------- tiny, safe markdown: **bold**, "- " bullets, links ---------- */

// Links never end in trailing punctuation ("…vercel.app," must not swallow the comma).
const LINK = /(https?:\/\/[^\s)]*[^\s).,;:!?]|\/resume\/[^\s)]*[^\s).,;:!?]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

function inline(text: string, key: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).flatMap((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return [<strong key={`${key}b${i}`}>{part.slice(2, -2)}</strong>];
    return part.split(LINK).map((chunk, j) => {
      if (!chunk) return null;
      // split() with a capture group puts the matched links at odd indexes.
      if (j % 2 === 1) {
        const href = chunk.includes("@") && !chunk.startsWith("http") ? `mailto:${chunk}` : chunk;
        return (
          <a key={`${key}l${i}${j}`} href={href} target="_blank" rel="noopener noreferrer">
            {chunk.replace(/^https?:\/\//, "")}
          </a>
        );
      }
      return <Fragment key={`${key}t${i}${j}`}>{chunk}</Fragment>;
    });
  });
}

function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (k: number) => {
    if (bullets.length) {
      blocks.push(
        <ul key={`u${k}`}>
          {bullets.map((b, i) => (
            <li key={i}>{inline(b, `u${k}${i}`)}</li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };
  text.split("\n").forEach((line, k) => {
    const t = line.trim();
    if (/^[-*•]\s+/.test(t)) bullets.push(t.replace(/^[-*•]\s+/, ""));
    else {
      flush(k);
      if (t) blocks.push(<p key={`p${k}`}>{inline(t, `p${k}`)}</p>);
    }
  });
  flush(9999);
  return <>{blocks}</>;
}

/* ---------- component ---------- */

function loadHistory(): Msg[] {
  try {
    const raw = JSON.parse(sessionStorage.getItem(STORE) || "null");
    return Array.isArray(raw) && raw.length ? raw : [GREETING];
  } catch {
    return [GREETING];
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ChatBot = () => {
  const { chatOpen, setChatOpen, unlock, online } = useExperience();
  const [messages, setMessages] = useState<Msg[]>(loadHistory);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [backend, setBackend] = useState<Backend>(
    () => (sessionStorage.getItem(BACKEND_KEY) as Backend | null) ?? "unknown"
  );
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-30)));
    } catch {
      /* ignore */
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatOpen) window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [chatOpen]);

  const rememberBackend = (b: Backend) => {
    setBackend(b);
    sessionStorage.setItem(BACKEND_KEY, b);
  };

  const appendToLast = (delta: string) =>
    setMessages((prev) => {
      const next = prev.slice();
      next[next.length - 1] = { ...next[next.length - 1], content: next[next.length - 1].content + delta };
      return next;
    });

  /** Stream from the Claude endpoint. Returns false if the backend isn't available. */
  const askClaude = async (history: Msg[]): Promise<boolean> => {
    let res: Response;
    try {
      res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.filter((m) => m !== GREETING) }),
      });
    } catch {
      return false;
    }
    if (!res.ok || !res.body || res.headers.get("X-Chat-Backend") !== "claude") return false;
    rememberBackend("claude");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      appendToLast(decoder.decode(value, { stream: true }));
    }
    return true;
  };

  /** Offline engine, "typed out" so it feels like the streamed version. */
  const askLocal = async (question: string, previous?: string) => {
    const answer = answerLocally(question, previous);
    const words = answer.split(/(\s+)/);
    for (let i = 0; i < words.length; i += 3) {
      appendToLast(words.slice(i, i + 3).join(""));
      await sleep(18);
    }
  };

  const send = async (text: string) => {
    const question = text.trim().slice(0, 1200);
    if (!question || busy) return;
    unlock("chat");
    setInput("");
    setBusy(true);
    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    try {
      const usedClaude = online && backend !== "local" ? await askClaude(history) : false;
      if (!usedClaude) {
        if (backend !== "local") rememberBackend("local");
        const previous = [...messages].reverse().find((m) => m.role === "user")?.content;
        await askLocal(question, previous);
      }
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const showSuggestions = messages.length <= 2 && !busy;

  return (
    <>
      <button
        className={`chat-launch${chatOpen ? " chat-launch-open" : ""}`}
        onClick={() => setChatOpen(!chatOpen)}
        aria-expanded={chatOpen}
        aria-controls="chat-panel"
        data-cursor="disable"
        data-magnetic
      >
        {chatOpen ? <MdClose aria-hidden="true" /> : <MdAutoAwesome aria-hidden="true" />}
        <span>{chatOpen ? "Close" : "Ask Yug"}</span>
      </button>

      {chatOpen && (
        <section
          id="chat-panel"
          className="chat"
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-title"
          data-cursor="disable"
        >
          <header className="chat-head">
            <div className="chat-avatar" aria-hidden="true">
              YJ
            </div>
            <div>
              <h2 id="chat-title">Ask Yug</h2>
              <p>
                <span className={`chat-dot chat-dot-${backend}`} aria-hidden="true" />
                {backend === "claude"
                  ? "AI · answers from his resume"
                  : backend === "local"
                    ? "Offline mode · answers from his resume"
                    : "Answers from his resume"}
              </p>
            </div>
            <button className="chat-x" onClick={() => setChatOpen(false)} aria-label="Close chat">
              <MdClose />
            </button>
          </header>

          <div className="chat-list" ref={listRef} role="log" aria-live="polite" aria-busy={busy}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-${m.role}`}>
                {m.content ? (
                  <Markdown text={m.content} />
                ) : (
                  <span className="chat-typing" aria-label="Typing">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </div>
            ))}
            {showSuggestions && (
              <div className="chat-suggest" aria-label="Suggested questions">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => void send(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={onSubmit}>
            <label htmlFor="chat-input" className="ov-sr-only">
              Your question
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={1200}
              placeholder="Ask about projects, skills, availability…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send">
              <MdSend />
            </button>
          </form>
        </section>
      )}
    </>
  );
};

export default ChatBot;
