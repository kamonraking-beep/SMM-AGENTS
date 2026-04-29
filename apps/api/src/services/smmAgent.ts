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

const saveDraftTool = tool({
  name: "save_content_draft",
  description: "Save completed social media content into the SMM draft system.",
  parameters: z.object({
    title: z.string(),
    content: z.string(),
    platform: z.string().default("instagram"),
  }),
  async execute(input) {
    return saveContentDraft({
      title: input.title,
      content: input.content,
      platform: input.platform,
    });
  },
});

const getDraftDetailsTool = tool({
  name: "get_draft_details",
  description: "Get full details of a draft by ID.",
  parameters: z.object({
    draftId: z.string(),
  }),
  async execute(input) {
    const response = await fetch(process.env.SMM_GET_DRAFT_DETAILS_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draft_id: input.draftId,
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
  }),
  async execute(input) {
    const response = await fetch(process.env.SMM_QUEUE_FOR_PUBLISH_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draft_id: input.draftId,
        approval_status: "approved",
        publish_target: "static_site",
        channel: input.channel,
      }),
    });

    return readJsonResponse(response);
  },
});

const publishTool = tool({
  name: "publish_content",
  description: "Publish a queued or approved draft to the live site.",
  parameters: z.object({
    draftId: z.string(),
  }),
  async execute(input) {
    const response = await fetch(process.env.SMM_PUBLISH_TO_STATIC_SITE_URL!, {
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

const smmAgent = new Agent({
  name: "Studio1Live SMM Agent",
  model: "gpt-5.4",
  instructions: `
You are the production social media manager for Studio1Live.

Create strong captions, hooks, CTAs, hashtags, and campaign copy.

Defaults:
- Brand: Studio1Live
- Location: Jacksonville
- Platform: Instagram
- Tone: energetic and professional
- CTA: DM to book

Draft Management Rules:
- When you create a final draft, call save_content_draft.
- Use get_draft_details when the user references a draft ID.
- Use queue_for_publish before publishing.
- Use publish_content only after confirmation.
- Always confirm the draft ID before publishing.
- Never fake draft data or tool results.
- Always return real system response details when available.

Important:
- There is not currently a list-drafts tool.
- If the user asks to show latest drafts, ask for a draft ID or explain that only draft details by ID are available right now.

Behavior:
- Do not show JSON.
- Do not mention tool calls unless asked.
- Keep responses direct and useful.
- Ask only essential questions.
`,
  tools: [
    saveDraftTool,
    getDraftDetailsTool,
    queueForPublishTool,
    publishTool,
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