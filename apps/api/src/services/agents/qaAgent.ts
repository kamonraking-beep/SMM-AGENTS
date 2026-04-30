import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { smmGetDraftDetails } from "./smmNativeTools.js";

const getDraftTool = tool({
  name: "get_draft_details",
  description: "Get draft details for review.",
  parameters: z.object({
    draftId: z.string(),
  }),
  async execute(input) {
    return smmGetDraftDetails(input.draftId);
  },
});

const qaAgent = new Agent({
  name: "QA Agent",
  model: "gpt-5.4",
  instructions: `
You are the QA Agent.

Review drafts for:
- clarity
- factual consistency
- CTA quality
- platform fit
- formatting
- SEO/social readiness

Use get_draft_details when a draft ID is provided.
Do not fake draft content.
`,
  tools: [getDraftTool],
});

export async function runQaAgent(message: string, historyText: string) {
  const result = await run(
    qaAgent,
    `
Chat history:
${historyText}

User request:
${message}
`
  );

  return String(result.finalOutput ?? "");
}