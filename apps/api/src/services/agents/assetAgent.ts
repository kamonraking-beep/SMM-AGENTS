import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { smmNativeWorkflow } from "./smmNativeTools.js";
import { runJacai } from "./jacaiNative.js";

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

const jacaiWorkflowTool = tool({
  name: "jacai_native_workflow",
  description:
    "Run JacAI native workflow for image, video, visual assets, attaching media, and draft media automation.",
  parameters: z.object({
    message: z.string(),
  }),
  async execute(input) {
    return runJacai(input.message);
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

For image/video generation or attaching media to a post, prefer jacai_native_workflow because JacAI correctly updates media_json before publishing.
Important:
- Do not guess low-level media API payloads.
- Route image/video work through SMM native flow.
- Return real media IDs, file paths, URLs, and errors from the SMM response.
`,
  tools: [jacaiWorkflowTool, smmAssetWorkflowTool],
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