import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { smmNativeWorkflow } from "./smmNativeTools.js";

const smmAssetWorkflowTool = tool({
  name: "smm_native_assets",
  description:
    "Use the SMM app native workflow for image, video, visual briefs, media generation, and attaching assets.",
  parameters: z.object({
    prompt: z.string(),
    toolKey: z.string(),
  }),
  async execute(input) {
    return smmNativeWorkflow(input.prompt, input.toolKey || "agent:writer");
  },
});

const assetAgent = new Agent({
  name: "Asset Agent",
  model: "gpt-5.4",
  instructions: `
You are the Asset Agent.

Use the SMM app native workflow for:
- visual briefs
- image generation
- video generation
- media attachments
- thumbnails
- social platform visual versions

Important:
- Do not guess low-level media API payloads.
- Route image/video work through SMM native flow.
- Return real media IDs, file paths, URLs, and errors from the SMM response.
`,
  tools: [smmAssetWorkflowTool],
});

export async function runAssetAgent(message: string, historyText: string) {
  const result = await run(
    assetAgent,
    `
Chat history:
${historyText}

User request:
${message}

Route this asset request through the SMM native workflow.
`
  );

  return String(result.finalOutput ?? "");
}