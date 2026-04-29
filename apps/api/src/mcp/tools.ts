import { postToSmmDraftApi } from "./client.js";

export type SaveContentDraftInput = {
  title: string;
  content: string;
  platform?: string;
  status?: "draft" | "review" | "approved";
  metadata?: Record<string, unknown>;
};

export async function saveContentDraft(input: SaveContentDraftInput) {
  const prompt = [
    `Title: ${input.title}`,
    `Platform: ${input.platform ?? "instagram"}`,
    `Status: ${input.status ?? "draft"}`,
    "",
    input.content,
  ].join("\n");

  return postToSmmDraftApi({
    action: "save_content_draft",
    prompt,
    title: input.title,
    content: input.content,
    platform: input.platform ?? "instagram",
    status: input.status ?? "draft",
    metadata: input.metadata ?? {},
  });
}