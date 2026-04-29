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

When you create a final draft, call save_content_draft.
Do not show JSON.
Do not mention tool calls unless asked.
`,
  tools: [saveDraftTool],
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