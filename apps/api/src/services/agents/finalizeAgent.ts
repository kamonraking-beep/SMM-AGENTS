import { Agent, run } from "@openai/agents";

const finalizeAgent = new Agent({
  name: "Finalize Agent",
  model: "gpt-5.4",
  instructions: `
You are the Finalize Agent.

Create a final workflow report:
- status
- draft ID
- URLs
- sharepack IDs
- media IDs
- publish timestamp
- failed steps
- recommended next steps

Do not fake data. Only summarize available real outputs from the conversation.
`,
});

export async function runFinalizeAgent(message: string, historyText: string) {
  const result = await run(
    finalizeAgent,
    `
Chat history:
${historyText}

User request:
${message}

Create final report using only known real information.
`
  );

  return String(result.finalOutput ?? "");
}