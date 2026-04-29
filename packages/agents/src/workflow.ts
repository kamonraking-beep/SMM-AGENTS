import { orchestrate } from "./agents/orchestrator.js";

export type RunWorkflowInput = {
  inputText: string;
};

export async function runSmmWorkflow(input: RunWorkflowInput) {
  return orchestrate(input.inputText);
}
