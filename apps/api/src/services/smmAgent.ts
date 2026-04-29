import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { saveContentDraft } from "../mcp/tools.js";

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

const getDraftsTool = tool({
  name: "get_drafts",
  description: "Fetch all drafts from SMM system",
  parameters: z.object({}),
  async execute() {
    const res = await fetch("http://localhost:4000/drafts");
    const data = await res.json();
    return data;
  },
});

const publishTool = tool({
  name: "publish_content",
  description: "Publish a draft by ID",
  parameters: z.object({
    draftId: z.string(),
  }),
  async execute(input) {
    const res = await fetch("http://localhost:4000/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ draftId: input.draftId }),
    });

    return await res.json();
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

You can manage drafts using tools:

- Use get_drafts when user asks to see drafts
- Use publish_content when user wants to publish
- Always confirm actions with real data (draft id, status)

Never fake confirmations.

When you create a final draft, call save_content_draft.
Do not show JSON.
Do not mention tool calls unless asked.
`,
  tools: [saveDraftTool, getDraftsTool, publishTool],
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