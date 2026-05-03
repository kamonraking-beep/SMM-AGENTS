const smmDraftUrl = process.env.SMM_CHAT_DRAFT_URL;

if (!smmDraftUrl) {
  throw new Error("Missing required env var: SMM_CHAT_DRAFT_URL");
}

export async function postToSmmDraftApi(payload: Record<string, unknown>) {
  const response = await fetch(smmDraftUrl, {
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