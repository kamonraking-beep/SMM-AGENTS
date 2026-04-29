export type SaveContentDraftInput = {
  title: string;
  content: string;
  platform?: string;
  status?: "draft" | "review" | "approved";
  metadata?: Record<string, unknown>;
};

export async function saveContentDraft(input: SaveContentDraftInput) {
  const metadata = input.metadata ?? {};
  const hashtags = Array.isArray(metadata.hashtags) ? metadata.hashtags : [];

  const response = await fetch(
    process.env.SMM_SAVE_CONTENT_DRAFT_URL!,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: input.title,
        caption: input.content,
        platform: input.platform ?? "instagram",
        content_type:
          typeof metadata.content_type === "string"
            ? metadata.content_type
            : "static_post",
        status: input.status ?? "draft",
        hashtags,
        cta:
          typeof metadata.cta === "string"
            ? metadata.cta
            : "DM to book",
        brand_profile:
          typeof metadata.brand_profile === "string"
            ? metadata.brand_profile
            : "Studio1Live",
        post_goal:
          typeof metadata.post_goal === "string"
            ? metadata.post_goal
            : "engagement",
      }),
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`SMM draft API failed: ${response.status} ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      ok: true,
      raw: text,
    };
  }
}