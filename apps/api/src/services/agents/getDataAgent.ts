import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { smmListDrafts } from "./smmNativeTools.js";

const listDraftsTool = tool({
  name: "get_drafts",
  description: "Get recent drafts from the SMM system.",
  parameters: z.object({
    limit: z.number(),
  }),
  async execute(input) {
    return smmListDrafts(input.limit || 5);
  },
});

const getDataAgent = new Agent({
  name: "get data",
  model: "gpt-5.4",
  instructions: `
You are a minimal clarification and lookup agent.

Rules:
- Ask at most 3 short questions.
- Never ask for project_id, site_profile_id, workflow IDs, timezone, or internal system fields.
- If the user asks about drafts, latest drafts, recent drafts, or what drafts exist, call get_drafts.
- If the user asks to publish but gives no draft ID, call get_drafts and identify the latest draft.
- Only ask a question if the missing info cannot be retrieved from tools.
- Do not generate final content.
`,
  tools: [listDraftsTool],
});

export async function askForMissingData(missingFields: string[], message: string) {
  const result = await run(
    getDataAgent,
    `
User request:
${message}

Missing fields:
${missingFields.join(", ")}
`
  );

  return String(result.finalOutput ?? "");
}