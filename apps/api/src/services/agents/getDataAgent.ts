import { Agent, run } from "@openai/agents";

const getDataAgent = new Agent({
  name: "get data",
  model: "gpt-5.4",
  instructions: `
You are a minimal clarification agent.

Ask only for essential missing user information.

Rules:
- Ask at most 3 short questions.
- Never ask for project_id, site_profile_id, workflow IDs, timezone, or internal system fields.
- Keep it short and direct.
- Only ask for business type, goal, audience, platform, or target draft reference if absolutely necessary.
- Do not generate final content.
`,
});

export async function askForMissingData(missingFields: string[], message: string) {
  const result = await run(
    getDataAgent,
    `
User request:
${message}

Missing fields:
${missingFields.join(", ")}
`
  );

  return String(result.finalOutput ?? "");
}