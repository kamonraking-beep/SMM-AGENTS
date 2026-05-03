"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://smm-agents-check-your-job.onrender.com";

export function ChatShell() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [working, setWorking] = useState(false);

  async function sendMessage() {
    const text = input.trim();
    if (!text || working) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(nextMessages);
    setInput("");
    setWorking(true);

    try {
      const response = await fetch(`${apiBaseUrl}/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: nextMessages,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        reply?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Agent request failed");
      }

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.reply ?? "No response returned.",
        },
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            error instanceof Error ? `Error: ${error.message}` : "Unknown error",
        },
      ]);
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            Ask me to create, revise, save, or prepare social content.
          </div>
        ) : (
          messages.map((message, index) => (
            <div className={`message ${message.role}`} key={index}>
              <strong>{message.role === "user" ? "You" : "Agent"}</strong>
              <p>{message.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-row">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Create a post for this brand..."
          rows={3}
          disabled={working}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
        />

        <button onClick={sendMessage} disabled={working || !input.trim()}>
          {working ? "Working..." : "Send"}
        </button>
      </div>
    </section>
  );
}