import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { echoMessage } from "./services/api";
import "./App.css";

type MessageRole = "assistant" | "user";

interface ChatMessage {
  id: number;
  role: MessageRole;
  content: string;
}

let nextMessageId = 1;

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      content: "Hi! Send a message to test the connection to your backend.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();

    if (!message || isSending) {
      return;
    }

    setDraft("");
    setError(null);
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: nextMessageId++, role: "user", content: message },
    ]);
    setIsSending(true);

    try {
      const echoedMessage = await echoMessage(message);
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: nextMessageId++, role: "assistant", content: echoedMessage },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The request could not be completed.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3.5v2M5.5 9.5h13v9h-13zM8.5 13h.01M15.5 13h.01M9 16h6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </div>
          <div>
            <p className="brand-kicker">PERSONAL AI</p>
            <h1>Assistant</h1>
          </div>
        </div>
        <span className="demo-badge">
          <span className="badge-dot" aria-hidden="true" />
          Echo demo
        </span>
      </header>

      <section className="chat-card" aria-label="Assistant chat">
        <div className="conversation-heading">
          <div>
            <h2>Conversation</h2>
            <p>Messages are sent to your backend for testing.</p>
          </div>
          <span className="conversation-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 6.75h14v9.5H9l-4 3v-12.5Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
              <path
                d="M8.5 10h7M8.5 13h4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.6"
              />
            </svg>
          </span>
        </div>

        <div className="message-list" role="log" aria-label="Conversation messages">
          {messages.map((message) => (
            <article
              className={`message-row message-row--${message.role}`}
              key={message.id}
            >
              <div className="message-avatar" aria-hidden="true">
                {message.role === "assistant" ? "A" : "Y"}
              </div>
              <div className="message-body">
                <span className="message-sender">
                  {message.role === "assistant" ? "Assistant" : "You"}
                </span>
                <p className="message-bubble">{message.content}</p>
              </div>
            </article>
          ))}
          {isSending && (
            <div className="message-row message-row--assistant" role="status">
              <div className="message-avatar" aria-hidden="true">
                A
              </div>
              <div className="message-body">
                <span className="message-sender">Assistant</span>
                <p className="message-bubble loading-message">
                  <span className="loading-indicator" aria-hidden="true" />
                  Waiting for the backend…
                </p>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        <div className="composer-area">
          {error && (
            <p className="error-message" role="alert">
              <span aria-hidden="true">!</span>
              {error}
            </p>
          )}
          <form className="composer" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="message-input">
              Your message
            </label>
            <input
              autoComplete="off"
              disabled={isSending}
              id="message-input"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write a message…"
              type="text"
              value={draft}
            />
            <button disabled={!draft.trim() || isSending} type="submit">
              {isSending ? "Sending…" : "Send"}
              {!isSending && (
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3.5 10h12m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </svg>
              )}
            </button>
          </form>
          <p className="composer-hint">Press Enter to send</p>
        </div>
      </section>

      <footer className="app-footer">
        This demo echoes messages through the backend. It does not generate AI
        responses.
      </footer>
    </main>
  );
}

export default App;
