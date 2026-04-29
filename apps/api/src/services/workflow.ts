import { runSmmWorkflow } from "@smm-ai/agents";

export async function runWorkflow(input: string) {
  return runSmmWorkflow({ inputText: input });
}
