import { ChatShell } from "@/components/chat/ChatShell";

export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>SMM AI App</h1>
      <p style={{ marginTop: 0, color: "#4b5563" }}>
        Research, draft, review, approve, and publish content from one chat surface.
      </p>
      <ChatShell />
    </main>
  );
}
