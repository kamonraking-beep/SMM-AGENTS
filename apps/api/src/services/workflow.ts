import { runSmmWorkflow } from "./smmAgent.js";

export async function runWorkflow(input: string) {
  return runSmmWorkflow({
    message: input,
    history: [],
  });
}