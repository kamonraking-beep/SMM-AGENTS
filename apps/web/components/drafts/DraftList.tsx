"use client";

import { useEffect, useState } from "react";
import type { Draft } from "@smm-ai/shared";

type ApiResponse = Draft[];

export function DraftList() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDrafts() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drafts`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to load drafts");
        }
        const data = (await response.json()) as ApiResponse;
        setDrafts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }

    void loadDrafts();
  }, []);

  if (error) return <p>{error}</p>;
  if (drafts.length === 0) return <p>No drafts yet.</p>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {drafts.map((draft) => (
        <article
          key={draft.id}
          style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "white" }}
        >
          <h3 style={{ marginTop: 0 }}>{draft.title}</h3>
          <p style={{ marginBottom: 0, color: "#4b5563" }}>Status: {draft.status}</p>
        </article>
      ))}
    </div>
  );
}
