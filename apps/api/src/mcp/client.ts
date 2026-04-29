type JsonObject = Record<string, unknown>;

const SMM_DRAFT_URL =
  process.env.SMM_CHAT_DRAFT_URL ??
  "https://studio1live.com/ashley/smm/szam/social-media-manager/api/chat_draft.php";

export async function postToSmmDraftApi(payload: JsonObject) {
  const response = await fetch(SMM_DRAFT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`SMM draft API failed: ${response.status} ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return { ok: true, raw: text };
  }
}