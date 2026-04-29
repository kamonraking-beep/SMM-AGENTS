export type SaveContentDraftInput = {
  title: string;
  content: string;
  platform?: string;
};

const defaultDraftUrl =
  "https://studio1live.com/ashley/smm/szam/social-media-manager/api/chat_draft.php";

export async function saveContentDraft(input: SaveContentDraftInput) {
  const url = process.env.SMM_CHAT_DRAFT_URL ?? defaultDraftUrl;

  const prompt = [
    `Title: ${input.title}`,
    `Platform: ${input.platform ?? "instagram"}`,
    "",
    input.content,
  ].join("\n");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "save_content_draft",
      prompt,
      title: input.title,
      content: input.content,
      platform: input.platform ?? "instagram",
      status: "draft",
    }),
  });

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