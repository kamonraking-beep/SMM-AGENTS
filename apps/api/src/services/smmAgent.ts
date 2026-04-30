import { runWorkflow } from "./agents/runWorkflow.js";

export async function runSmmWorkflow(input: {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  return runWorkflow(input);
}