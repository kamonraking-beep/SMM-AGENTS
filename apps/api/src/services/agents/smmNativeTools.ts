type JsonBody = Record<string, unknown>;

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function readJson(response: Response) {
  const text = await response.text();

  try {
    const data = JSON.parse(text);
    if (!response.ok) return { ok: false, status: response.status, data };
    return data;
  } catch {
    return {
      ok: false,
      status: response.status,
      error: "Non-JSON response",
      body: text,
    };
  }
}

export async function smmChatDraft(action: string, body: JsonBody) {
  const url = new URL(requiredEnv("SMM_CHAT_DRAFT_URL"));
  url.searchParams.set("action", action);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return readJson(response);
}

export async function smmGenerate(params: {
  prompt: string;
  toolKey?: string;
  tone?: string;
  wordCount?: number;
  siteProfileId?: number;
}) {
  return smmChatDraft("generate", {
    prompt: params.prompt,
    tool_key: params.toolKey ?? "openai_writer",
    tone: params.tone ?? "clear, polished, practical, and engaging",
    word_count: params.wordCount ?? 1200,
    site_profile_id: params.siteProfileId ?? 0,
  });
}

export async function smmListWriters() {
  return smmChatDraft("list_writers", {});
}

export async function smmGetDraftDetails(draftId: string) {
  const response = await fetch(requiredEnv("SMM_GET_DRAFT_DETAILS_URL"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft_id: draftId }),
  });

  return readJson(response);
}

export async function smmQueueForPublish(params: {
  draftId: string;
  channel?: string;
  publishTarget?: string;
  publishAt?: string;
}) {
  const response = await fetch(requiredEnv("SMM_QUEUE_FOR_PUBLISH_URL"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      draft_id: params.draftId,
      approval_status: "approved",
      publish_target: params.publishTarget ?? "static_site",
      channel: params.channel ?? "facebook",
      publish_at: params.publishAt,
    }),
  });

  return readJson(response);
}

export async function smmPublishToStaticSite(draftId: string) {
  const response = await fetch(requiredEnv("SMM_PUBLISH_TO_STATIC_SITE_URL"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      draft_id: draftId,
      publish_now: true,
    }),
  });

  return readJson(response);
}

export async function smmRunTagX(articleId: string) {
  const response = await fetch(requiredEnv("SMM_TAGX_RUN_URL"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ article_id: articleId }),
  });

  return readJson(response);
}

export async function smmGenerateSharepack(articleId: string, platforms: string[]) {
  const url = new URL(requiredEnv("SMM_SHAREPACKS_URL"));
  url.searchParams.set("action", "generate_from_article");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      article_id: articleId,
      platforms,
    }),
  });

  return readJson(response);
}

export async function smmListDrafts(limit: number) {
  const url = new URL(requiredEnv("SMM_CRUD_URL"));
  url.searchParams.set("action", "list_articles");

  const response = await fetch(url.toString(), { method: "GET" });
  const data = await readJson(response);

  const items = (data as { items?: unknown }).items;
  if (Array.isArray(items)) {
    return { ...(data as Record<string, unknown>), items: items.slice(0, limit) };
  }

  return data;
}

export async function smmNativeWorkflow(prompt: string, toolKey = "openai_writer") {
  return smmGenerate({
    prompt,
    toolKey,
    wordCount: 1200,
  });
}