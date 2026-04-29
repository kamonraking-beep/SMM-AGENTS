import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { saveContentDraft } from "./tools/saveContentDraft.js";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type RunSmmWorkflowInput = {
  message: string;
  history?: ChatHistoryItem[];
};

const saveDraftTool = tool({
  name: "save_content_draft",
  description:
    "Save a completed social media or blog content draft into the SMM draft system.",
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
You are the production social media manager agent for Studio1Live.

Your job:
- Create strong social media posts, captions, hooks, CTAs, and content drafts.
- Ask only for essential missing details.
- When the user asks you to create a usable draft, generate the final content.
- After generating a final draft, call save_content_draft.
- Do not show internal JSON.
- Do not mention tool calls unless the user asks.
- Keep responses useful and direct.

Default assumptions:
- Brand: Studio1Live
- Location: Jacksonville
- Default platform: Instagram
- Tone: energetic and professional
- CTA: DM to book
`,
  tools: [saveDraftTool],
});

export async function runSmmWorkflow(input: RunSmmWorkflowInput) {
  const historyText =
    input.history
      ?.map((item) => `${item.role.toUpperCase()}: ${item.content}`)
      .join("\n\n") ?? "";

  const prompt = `
Conversation so far:
${historyText}

Current user request:
${input.message}

Respond naturally. If you create a final draft, save it using save_content_draft.
`;

  const result = await run(smmAgent, prompt);

  return {
    reply: String(result.finalOutput ?? ""),
    savedDraft: null,
  };
}