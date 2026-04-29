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
    return {
      ok: false,
      status: response.status,
      body: data,
    };
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
    platform: z.string().default("instagram"),
    contentType: z.string().default("static_post"),
    cta: z.string().default("DM to book"),
    hashtags: z.array(z.string()).default([]),
  }),
  async execute(input) {
    return saveContentDraft({
      title: input.title,
      content: input.content,
      platform: input.platform,
      metadata: {
        content_type: input.contentType,
        cta: input.cta,
        hashtags: input.hashtags,
      },
    });
  },
});

const listDraftsTool = tool({
  name: "list_drafts",
  description: "List recent SMM drafts/articles.",
  parameters: z.object({
    limit: z.number().int().min(1).max(50).default(10),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_CRUD_URL"));
    url.searchParams.set("action", "list_articles");

    const response = await fetch(url.toString(), {
      method: "GET",
    });

    const data = await readJsonResponse(response);

    if (
      typeof data === "object" &&
      data !== null &&
      "ok" in data &&
      "items" in data
    ) {
      const items = Array.isArray((data as { items?: unknown }).items)
        ? ((data as { items: unknown[] }).items).slice(0, input.limit)
        : [];

      return {
        ...(data as Record<string, unknown>),
        items,
      };
    }

    return data;
  },
});

const getDraftDetailsTool = tool({
  name: "get_draft_details",
  description: "Get full details of a draft by ID, slug, or title.",
  parameters: z.object({
    draftId: z.string().optional(),
    slug: z.string().optional(),
    title: z.string().optional(),
  }),
  async execute(input) {
    const response = await fetch(requiredEnv("SMM_GET_DRAFT_DETAILS_URL"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draft_id: input.draftId,
        slug: input.slug,
        title: input.title,
      }),
    });

    return readJsonResponse(response);
  },
});

const queueForPublishTool = tool({
  name: "queue_for_publish",
  description: "Approve and queue a draft for publishing.",
  parameters: z.object({
    draftId: z.string(),
    channel: z.string().default("facebook"),
    publishTarget: z.string().default("static_site"),
    publishAt: z.string().optional(),
  }),
  async execute(input) {
    const response = await fetch(requiredEnv("SMM_QUEUE_FOR_PUBLISH_URL"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draft_id: input.draftId,
        approval_status: "approved",
        publish_target: input.publishTarget,
        channel: input.channel,
        publish_at: input.publishAt,
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draft_id: input.draftId,
        publish_now: true,
      }),
    });

    return readJsonResponse(response);
  },
});

const generateVisualBriefTool = tool({
  name: "generate_visual_brief",
  description: "Generate image/video creative prompts for a draft or content topic.",
  parameters: z.object({
    platform: z.string().default("social"),
    brandProfile: z.string().default("Studio1Live"),
    postGoal: z.string().default("engagement"),
    captionOrTopic: z.string(),
    visualStyle: z.string().default("clean, modern, energetic, studio-quality"),
    assetMode: z.enum(["image", "video", "both"]).default("both"),
  }),
  async execute(input) {
    const response = await fetch(requiredEnv("SMM_GENERATE_VISUAL_BRIEF_URL"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform: input.platform,
        brand_profile: input.brandProfile,
        post_goal: input.postGoal,
        caption_or_topic: input.captionOrTopic,
        visual_style: input.visualStyle,
        asset_mode: input.assetMode,
      }),
    });

    return readJsonResponse(response);
  },
});

const attachAssetToDraftTool = tool({
  name: "attach_asset_to_draft",
  description: "Attach asset URLs, featured image/video, or prompts to a draft.",
  parameters: z.object({
    draftId: z.string(),
    featuredImage: z.string().optional(),
    featuredVideo: z.string().optional(),
    imagePrompt: z.string().optional(),
    videoBrief: z.string().optional(),
    imageAssets: z.array(z.string()).default([]),
    videoAssets: z.array(z.string()).default([]),
    assetUrls: z.array(z.string()).default([]),
    assetLabel: z.string().optional(),
    assetType: z.string().optional(),
  }),
  async execute(input) {
    const response = await fetch(requiredEnv("SMM_ATTACH_ASSET_TO_DRAFT_URL"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draft_id: input.draftId,
        featured_image: input.featuredImage,
        featured_video: input.featuredVideo,
        image_prompt: input.imagePrompt,
        video_brief: input.videoBrief,
        image_assets: input.imageAssets,
        video_assets: input.videoAssets,
        asset_urls: input.assetUrls,
        asset_label: input.assetLabel,
        asset_type: input.assetType,
        updated_by: "smm_agent",
      }),
    });

    return readJsonResponse(response);
  },
});

const generateVideoAssetTool = tool({
  name: "generate_video_asset",
  description: "Generate a video asset brief/record for a draft or campaign.",
  parameters: z.object({
    prompt: z.string(),
    style: z.string().default("modern social media promo"),
    durationSeconds: z.number().int().min(3).max(120).default(15),
    aspectRatio: z.string().default("9:16"),
    draftId: z.string().optional(),
  }),
  async execute(input) {
    const response = await fetch(requiredEnv("SMM_GENERATE_VIDEO_ASSET_URL"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input.prompt,
        style: input.style,
        duration_seconds: input.durationSeconds,
        aspect_ratio: input.aspectRatio,
        draft_id: input.draftId,
      }),
    });

    return readJsonResponse(response);
  },
});

const generateSharepackTool = tool({
  name: "generate_sharepack",
  description: "Generate multi-platform share copy from an article/draft ID.",
  parameters: z.object({
    articleId: z.string(),
    platforms: z.array(z.string()).default(["facebook", "x", "linkedin"]),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_SHAREPACKS_URL"));
    url.searchParams.set("action", "generate_from_article");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        article_id: input.articleId,
        platforms: input.platforms,
      }),
    });

    return readJsonResponse(response);
  },
});

const listSharepacksTool = tool({
  name: "list_sharepacks",
  description: "List sharepacks by status.",
  parameters: z.object({
    status: z.string().default("due"),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_SHAREPACKS_URL"));
    url.searchParams.set("action", "list");
    url.searchParams.set("status", input.status);

    const response = await fetch(url.toString(), {
      method: "GET",
    });

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: input.id,
      }),
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
    const response = await fetch(requiredEnv("SMM_TAGX_RUN_URL"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        article_id: input.articleId,
      }),
    });

    return readJsonResponse(response);
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: input.id,
      }),
    });

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

    const response = await fetch(url.toString(), {
      method: "GET",
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
    toolName: z.string().default("openai_image"),
  }),
  async execute(input) {
    const url = new URL(requiredEnv("SMM_MEDIA_URL"));
    url.searchParams.set("action", "generate_image");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        article_id: input.articleId,
        prompt: input.prompt,
        tool_name: input.toolName,
      }),
    });

    return readJsonResponse(response);
  },
});

const smmAgent = new Agent({
  name: "Studio1Live SMM Agent",
  model: "gpt-5.4",
  instructions: `
You are the production social media manager and publishing operator for Studio1Live.

Core goals:
- Create strong captions, hooks, CTAs, hashtags, video concepts, campaign copy, and publish-ready content.
- Save drafts into SMM when the user asks to create usable content.
- Retrieve and manage drafts by ID.
- Prepare, queue, publish, create sharepacks, generate visual briefs, and attach assets when requested.

Defaults:
- Brand: Studio1Live
- Location: Jacksonville
- Default platform: Instagram unless user specifies otherwise
- Tone: energetic, professional, direct
- CTA: DM to book

Draft rules:
- When creating a final content draft, call save_content_draft.
- Use list_drafts when the user asks for latest drafts or recent drafts.
- Use get_draft_details when the user references a draft ID, slug, or title.
- Use queue_for_publish before publish_content.
- Use publish_content only after user confirms publishing.
- Always confirm the draft ID before publishing.
- Never fake draft data or tool results.
- Return actual IDs, statuses, URLs, and errors from tool responses when available.

Asset rules:
- Use generate_visual_brief when the user asks for image ideas, creative direction, thumbnail text, b-roll, or a visual brief.
- Use generate_image_asset when the user asks to generate an image asset for an existing draft/article.
- Use attach_asset_to_draft when attaching a URL, generated asset, featured image, or video asset to a draft.
- Use generate_video_asset when the user asks for video asset generation/briefing.

Distribution rules:
- Use generate_sharepack when the user asks to repurpose a published/draft article into multi-platform social posts.
- Use list_sharepacks when user asks for due/pending sharepacks.
- Use mark_sharepack_done when user says a sharepack is completed.
- Use tagx_main when user asks for tags, hashtags, SEO tags, or TagX.
- Use zapier_webhook when user asks to send/sync a draft/article through Zapier.

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
    generateVideoAssetTool,
    generateSharepackTool,
    listSharepacksTool,
    markSharepackDoneTool,
    tagxTool,
    zapierWebhookTool,
    listMediaTool,
    generateImageTool,
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