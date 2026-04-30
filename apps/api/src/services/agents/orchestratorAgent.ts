import { Agent, run } from "@openai/agents";
import { z } from "zod";

export const routeSchema = z.object({
  has_all_details: z.boolean(),
  intent: z.enum(["plan", "create", "review", "assets", "publish", "finalize"]),
  missing_fields: z.array(z.string()),
});

export type RouteDecision = z.infer<typeof routeSchema>;

const orchestratorAgent = new Agent({
  name: "Orchestrator",
  model: "gpt-5.4",
  instructions: `
You are the Orchestrator/Triage Agent for the automated content system.

Triage logic:
- Check if necessary data is provided.
- If important business/user-facing data is missing, ask for it.
- Do not ask for internal fields like project_id, site_profile_id, workflow IDs, or timezone.

Route intents:
- plan: strategy, SEO, outline, campaign planning
- create: drafting posts, articles, captions, content creation
- review: QA, editing, checking, improving existing draft
- assets: image, video, visual brief, media, thumbnails
- publish: queue, publish, TagX, sharepack, Zapier, distribution
- finalize: completion report, archive, final summary

Return only structured routing data.
`,
});

export async function routeRequest(message: string, historyText: string) {
  const result = await run(
    orchestratorAgent,
    `
Chat history:
${historyText}

User request:
${message}

Return JSON matching:
{
  "has_all_details": boolean,
  "intent": "plan" | "create" | "review" | "assets" | "publish" | "finalize",
  "missing_fields": string[]
}
`
  );

  const raw = String(result.finalOutput ?? "{}");

  try {
    return routeSchema.parse(JSON.parse(raw));
  } catch {
    const lower = message.toLowerCase();

    if (lower.includes("publish") || lower.includes("sharepack") || lower.includes("tagx")) {
      return { has_all_details: true, intent: "publish", missing_fields: [] } as RouteDecision;
    }

    if (
      lower.includes("image") ||
      lower.includes("video") ||
      lower.includes("asset") ||
      lower.includes("visual")
    ) {
      return { has_all_details: true, intent: "assets", missing_fields: [] } as RouteDecision;
    }

    if (lower.includes("plan") || lower.includes("strategy")) {
      return { has_all_details: true, intent: "plan", missing_fields: [] } as RouteDecision;
    }

    return { has_all_details: true, intent: "create", missing_fields: [] } as RouteDecision;
  }
}