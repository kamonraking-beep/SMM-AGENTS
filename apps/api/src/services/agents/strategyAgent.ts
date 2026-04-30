import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { smmNativeWorkflow } from "./smmNativeTools.js";

const smmStrategyTool = tool({
  name: "smm_native_strategy",
  description: "Use the SMM app native flow to create a strategy/outline draft.",
  parameters: z.object({
    prompt: z.string(),
    toolKey: z.string(),
  }),
  async execute(input) {
    return smmNativeWorkflow(input.prompt, input.toolKey || "agent:writer");
  },
});

const strategyAgent = new Agent({
  name: "SSM Strategy Agent",
  model: "gpt-5.4",
  instructions: `
You are the SSM Strategy Agent.

Create content strategy:
- keywords
- SEO metadata
- outline
- H1/H2/H3 structure
- content angles
- recommended word count
- research needs

Use SMM native flow to save the strategy as a draft or strategy document.
`,
  tools: [smmStrategyTool],
});

export async function runStrategyAgent(message: string, historyText: string) {
  const result = await run(
    strategyAgent,
    `
Chat history:
${historyText}

User request:
${message}
`
  );

  return String(result.finalOutput ?? "");
}