import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { smmNativeWorkflow } from "./smmNativeTools.js";

const smmCreateTool = tool({
  name: "smm_native_create",
  description: "Use the SMM app native writer/orchestration flow to create and save content.",
  parameters: z.object({
    prompt: z.string(),
    toolKey: z.string(),
  }),
  async execute(input) {
    return smmNativeWorkflow(input.prompt, input.toolKey || "openai_writer");
  },
});

const contentAgent = new Agent({
  name: "SMM Content Agent",
  model: "gpt-5.4",
  instructions: `
You are the SMM Content Agent.

Create high-quality, engaging content using the SMM app native orchestration.

Rules:
- Prefer smm_native_create for final drafts.
- Use toolKey "openai_writer" for normal writing.
- Use toolKey "agent:writer" when the user asks for the writer agent.
- Do not directly call image/video/publish endpoints.
- Return real draft IDs, slugs, URLs, and statuses from the SMM response.
- Do not fake confirmations.
`,
  tools: [smmCreateTool],
});

export async function runContentAgent(message: string, historyText: string) {
  const result = await run(
    contentAgent,
    `
Chat history:
${historyText}

User request:
${message}

If this is a usable content request, create/save it through SMM native flow.
`
  );

  return String(result.finalOutput ?? "");
}