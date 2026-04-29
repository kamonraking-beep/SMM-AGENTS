"use client";

import Script from "next/script";
import { ChatKit, useChatKit } from "@openai/chatkit-react";

export function ChatShell() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        const endpoint = existing ? "/api/chatkit/session?mode=refresh" : "/api/chatkit/session";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(existing ? { currentClientSecret: existing } : {}),
        });

        if (!response.ok) {
          throw new Error("Failed to create or refresh ChatKit session");
        }

        const data = (await response.json()) as { client_secret: string };
        return data.client_secret;
      },
    },
  });

  return (
    <section>
      <Script
        src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
        strategy="afterInteractive"
      />
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          background: "white",
          padding: 12,
          minHeight: 640,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <ChatKit control={control} className="h-[640px] w-full" />
      </div>
    </section>
  );
}
