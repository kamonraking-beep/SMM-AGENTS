import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { saveContentDraft } from "../mcp/tools.js";

async function readJsonResponse(response: Response) {
  const text = await response.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    return { ok: false, status: response.status, body: data };
  }

  return data;
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const saveDraftTool = tool({
  name: "save_content_draft",
  description: "Save completed social media content into the SMM draft system.",
  parameters: z.object({
    title: z.string(),
    content: z.string(),
    platform: z.string(),
    contentType: z.string(),
    cta: z.string(),
    hashtags: z.array(z.string()),
  }),
  async execute(input) {
    return saveContentDraft({
      title: input.title,
      content: input.content,
      platform: input.platform || "instagram",
      metadata: {
        content_type: input.contentType || "static_post",
        cta: input.cta || "DM to book",
        hashtags: input.hashtags || [],
      },
    });
  },
});

const listDraftsTool = tool({
  name: "list_drafts",
  description: "List recent SMM drafts/articles.",
  parameters: z.object({
    limit: z.number(),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_CRUD_URL"));
    url.searchParams.set("action", "list_articles");

    const response = await fetch(url.toString(), { method: "GET" });
    const data = await readJsonResponse(response);

    const maybeItems = (data as { items?: unknown }).items;
    if (Array.isArray(maybeItems)) {
      return {
        ...(data as Record<string, unknown>),
        items: maybeItems.slice(0, input.limit || 10),
      };
    }

    return data;
  },
});

const getDraftDetailsTool = tool({
  name: "get_draft_details",
  description: "Get full details of a draft by ID.",
  parameters: z.object({
    draftId: z.string(),
  }),
  async execute(input) {
    const response = await fetch(requiredEnv("SMM_GET_DRAFT_DETAILS_URL"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft_id: input.draftId }),
    });

    return readJsonResponse(response);
  },
});

const queueForPublishTool = tool({
  name: "queue_for_publish",
  description: "Approve and queue a draft for publishing.",
  parameters: z.object({
    draftId: z.string(),
    channel: z.string(),
    publishTarget: z.string(),
    publishAt: z.string(),
  }),
  async execute(input) {
    const response = await fetch(requiredEnv("SMM_QUEUE_FOR_PUBLISH_URL"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draft_id: input.draftId,
        approval_status: "approved",
        publish_target: input.publishTarget || "static_site",
        channel: input.channel || "facebook",
        publish_at: input.publishAt || undefined,
      }),
    });

    return readJsonResponse(response);
  },
});

const publishTool = tool({
  name: "publish_content",
  description: "Publish a queued or approved draft to the live static site.",
  parameters: z.object({
    draftId: z.string(),
  }),
  async execute(input) {
    const response = await fetch(requiredEnv("SMM_PUBLISH_TO_STATIC_SITE_URL"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft_id: input.draftId, publish_now: true }),
    });

    return readJsonResponse(response);
  },
});

const generateVisualBriefTool = tool({
  name: "generate_visual_brief",
  description: "Generate image/video creative prompts for a draft or content topic.",
  parameters: z.object({
    platform: z.string(),
    brandProfile: z.string(),
    postGoal: z.string(),
    captionOrTopic: z.string(),
    visualStyle: z.string(),
    assetMode: z.string(),
  }),
  async execute(input) {
    const response = await fetch(requiredEnv("SMM_GENERATE_VISUAL_BRIEF_URL"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: input.platform || "social",
        brand_profile: input.brandProfile || "Studio1Live",
        post_goal: input.postGoal || "engagement",
        caption_or_topic: input.captionOrTopic,
        visual_style: input.visualStyle || "clean, modern, energetic, studio-quality",
        asset_mode: input.assetMode || "both",
      }),
    });

    return readJsonResponse(response);
  },
});

const attachAssetToDraftTool = tool({
  name: "attach_asset_to_draft",
  description: "Attach asset URLs, featured image/video, prompts, or generated asset references to a draft.",
  parameters: z.object({
    draftId: z.string(),
    featuredImage: z.string(),
    featuredVideo: z.string(),
    imagePrompt: z.string(),
    videoBrief: z.string(),
    imageAssets: z.array(z.string()),
    videoAssets: z.array(z.string()),
    assetUrls: z.array(z.string()),
    assetLabel: z.string(),
    assetType: z.string(),
  }),
  async execute(input) {
    const response = await fetch(requiredEnv("SMM_ATTACH_ASSET_TO_DRAFT_URL"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draft_id: input.draftId,
        featured_image: input.featuredImage || undefined,
        featured_video: input.featuredVideo || undefined,
        image_prompt: input.imagePrompt || undefined,
        video_brief: input.videoBrief || undefined,
        image_assets: input.imageAssets || [],
        video_assets: input.videoAssets || [],
        asset_urls: input.assetUrls || [],
        asset_label: input.assetLabel || undefined,
        asset_type: input.assetType || undefined,
        updated_by: "smm_agent",
      }),
    });

    return readJsonResponse(response);
  },
});

const generateImageTool = tool({
  name: "generate_image_asset",
  description: "Generate an image asset for a draft/article using the SMM media API.",
  parameters: z.object({
    articleId: z.string(),
    prompt: z.string(),
    toolName: z.string(),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_MEDIA_URL"));
    url.searchParams.set("action", "generate_image");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        article_id: input.articleId,
        prompt: input.prompt,
        tool_name: input.toolName || "openai_image_gen",
      }),
    });

    return readJsonResponse(response);
  },
});

const editImageTool = tool({
  name: "edit_image_asset",
  description: "Edit an existing image media asset using the SMM media API.",
  parameters: z.object({
    mediaId: z.string(),
    prompt: z.string(),
    toolName: z.string(),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_MEDIA_URL"));
    url.searchParams.set("action", "edit_image");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_id: input.mediaId,
        prompt: input.prompt,
        tool_name: input.toolName || "openai_image_edit",
      }),
    });

    return readJsonResponse(response);
  },
});

const generateVideoTool = tool({
  name: "generate_video_asset",
  description: "Generate a video job/media asset for a draft/article using the SMM media API.",
  parameters: z.object({
    articleId: z.string(),
    prompt: z.string(),
    toolName: z.string(),
    duration: z.number(),
    size: z.string(),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_MEDIA_URL"));
    url.searchParams.set("action", "generate_video");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        article_id: input.articleId,
        prompt: input.prompt,
        tool_name: input.toolName || "openai_video",
        duration: input.duration || 6,
        size: input.size || "1280x720",
      }),
    });

    return readJsonResponse(response);
  },
});

const getVideoStatusTool = tool({
  name: "get_video_status",
  description: "Check and update status for a generated video media asset.",
  parameters: z.object({
    mediaId: z.string(),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_MEDIA_URL"));
    url.searchParams.set("action", "video_status");
    url.searchParams.set("media_id", input.mediaId);

    const response = await fetch(url.toString(), { method: "GET" });
    return readJsonResponse(response);
  },
});

const listMediaTool = tool({
  name: "list_media",
  description: "List media assets for a draft/article.",
  parameters: z.object({
    articleId: z.string(),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_MEDIA_URL"));
    url.searchParams.set("action", "list_by_article");
    url.searchParams.set("article_id", input.articleId);

    const response = await fetch(url.toString(), { method: "GET" });
    return readJsonResponse(response);
  },
});

const generateSharepackTool = tool({
  name: "generate_sharepack",
  description: "Generate multi-platform share copy from an article/draft ID.",
  parameters: z.object({
    articleId: z.string(),
    platforms: z.array(z.string()),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_SHAREPACKS_URL"));
    url.searchParams.set("action", "generate_from_article");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        article_id: input.articleId,
        platforms: input.platforms || ["facebook", "instagram", "linkedin", "x"],
      }),
    });

    return readJsonResponse(response);
  },
});

const listSharepacksTool = tool({
  name: "list_sharepacks",
  description: "List sharepacks by status.",
  parameters: z.object({
    status: z.string(),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_SHAREPACKS_URL"));
    url.searchParams.set("action", "list");
    url.searchParams.set("status", input.status || "due");

    const response = await fetch(url.toString(), { method: "GET" });
    return readJsonResponse(response);
  },
});

const markSharepackDoneTool = tool({
  name: "mark_sharepack_done",
  description: "Mark a sharepack as done.",
  parameters: z.object({
    id: z.string(),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_SHAREPACKS_URL"));
    url.searchParams.set("action", "mark_done");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: input.id }),
    });

    return readJsonResponse(response);
  },
});

const tagxTool = tool({
  name: "tagx_main",
  description: "Run TagX for an article/draft ID.",
  parameters: z.object({
    articleId: z.string(),
  }),
  async execute(input) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await fetch(requiredEnv("SMM_TAGX_RUN_URL"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: input.articleId }),
      });

      const result = await readJsonResponse(response);
      const resultText = JSON.stringify(result);

      if (!resultText.includes("database is locked")) {
        return result;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }

    return {
      ok: false,
      error: "TagX database is locked after 3 retries. Try again shortly.",
      article_id: input.articleId,
    };
  },
});

const zapierWebhookTool = tool({
  name: "zapier_webhook",
  description: "Send an article/draft to the configured Zapier webhook.",
  parameters: z.object({
    id: z.string(),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_ZAPIER_URL"));
    url.searchParams.set("action", "send");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: input.id }),
    });

    return readJsonResponse(response);
  },
});

const smmAgent = new Agent({
  name: "Studio1Live SMM Agent",
  model: "gpt-5.4",
  instructions: `
You are the production social media manager and publishing operator for Studio1Live.

When using tools, always provide every field in the schema. Use empty strings, empty arrays, or sensible defaults for unknown optional values.

Core goals:
- Create strong captions, hooks, CTAs, hashtags, video concepts, campaign copy, and publish-ready content.
- Save drafts into SMM when the user asks to create usable content.
- Retrieve and manage drafts by ID.
- Prepare, queue, publish, create sharepacks, generate visual briefs, generate media, and attach assets when requested.

Defaults:
- Brand: Studio1Live
- Location: Jacksonville
- Default platform: Instagram unless user specifies otherwise
- Tone: energetic, professional, direct
- CTA: DM to book
- Default image generation toolName: openai_image_gen
- Default image edit toolName: openai_image_edit
- Default video generation toolName: openai_video
- Default video duration: 6
- Default video size: 1280x720

Draft rules:
- When creating a final content draft, call save_content_draft.
- Use list_drafts when the user asks for latest drafts or recent drafts.
- Use get_draft_details only when the user provides a draft ID.
- Use queue_for_publish before publish_content.
- Use publish_content only after user confirms publishing.
- Always confirm the draft ID before publishing.
- Never fake draft data or tool results.
- Return actual IDs, statuses, URLs, and errors from tool responses when available.

Media rules:
- Use generate_visual_brief when the user asks for image ideas, creative direction, thumbnail text, b-roll, or a visual brief.
- Use generate_image_asset for actual image generation. Always pass toolName "openai_image_gen" unless the user explicitly says otherwise.
- Use edit_image_asset for image edits. Always pass toolName "openai_image_edit" unless the user explicitly says otherwise.
- Use generate_video_asset for actual video generation. Always pass toolName "openai_video", duration 6, and size "1280x720" unless the user specifies otherwise.
- Use get_video_status after video generation returns a media_id.
- Use list_media to show generated/uploaded assets for an article.
- Use attach_asset_to_draft after generating or selecting media if the user wants it attached.

Distribution rules:
- Use generate_sharepack when the user asks to repurpose a published/draft article into multi-platform social posts.
- Use list_sharepacks when user asks for due/pending sharepacks.
- Use mark_sharepack_done when user says a sharepack is completed.
- Use tagx_main when user asks for tags, hashtags, SEO tags, or TagX.
- Zapier is not fully activated yet. Only use zapier_webhook if the user explicitly asks to send through Zapier.

Behavior:
- Do not show JSON unless explicitly asked.
- Do not mention internal tool calls unless asked.
- Ask only essential questions.
- If a tool returns an error, state the error clearly and suggest the next fix.
- Keep responses direct and action-oriented.
`,
  tools: [
    saveDraftTool,
    listDraftsTool,
    getDraftDetailsTool,
    queueForPublishTool,
    publishTool,
    generateVisualBriefTool,
    attachAssetToDraftTool,
    generateImageTool,
    editImageTool,
    generateVideoTool,
    getVideoStatusTool,
    listMediaTool,
    generateSharepackTool,
    listSharepacksTool,
    markSharepackDoneTool,
    tagxTool,
    zapierWebhookTool,
  ],
});

export async function runSmmWorkflow(input: {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const historyText =
    input.history
      ?.map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n") ?? "";

  const result = await run(
    smmAgent,
    `
Conversation:
${historyText}

User request:
${input.message}
`
  );

  return {
    reply: String(result.finalOutput ?? ""),
  };
}
