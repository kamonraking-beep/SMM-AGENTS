import { askForMissingData } from "./getDataAgent.js";
import { routeRequest } from "./orchestratorAgent.js";
import { runAssetAgent } from "./assetAgent.js";
import { runContentAgent } from "./contentAgent.js";
import { runFinalizeAgent } from "./finalizeAgent.js";
import { runPublishAgent } from "./publishAgent.js";
import { runQaAgent } from "./qaAgent.js";
import { runStrategyAgent } from "./strategyAgent.js";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export async function runWorkflow(input: {
  message: string;
  history?: ChatHistoryItem[];
}) {
  const historyText =
    input.history
      ?.map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n") ?? "";

  const route = await routeRequest(input.message, historyText);

  if (!route.has_all_details) {
    return {
      reply: await askForMissingData(route.missing_fields, input.message),
      route,
    };
  }

  if (route.intent === "plan") {
    return { reply: await runStrategyAgent(input.message, historyText), route };
  }

  if (route.intent === "create") {
    return { reply: await runContentAgent(input.message, historyText), route };
  }

  if (route.intent === "review") {
    return { reply: await runQaAgent(input.message, historyText), route };
  }

  if (route.intent === "assets") {
    return { reply: await runAssetAgent(input.message, historyText), route };
  }

  if (route.intent === "publish") {
    return { reply: await runPublishAgent(input.message, historyText), route };
  }

  return { reply: await runFinalizeAgent(input.message, historyText), route };
}