const openAiBaseUrl = "https://api.openai.com/v1";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function createChatKitSession(params: { userId: string }) {
  const apiKey = getRequiredEnv("OPENAI_API_KEY");
  const workflowId = getRequiredEnv("OPENAI_WORKFLOW_ID");

  const response = await fetch(`${openAiBaseUrl}/chatkit/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Beta": "chatkit_beta=v1",
    },
    body: JSON.stringify({
      workflow: { id: workflowId },
      user: params.userId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ChatKit session creation failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    client_secret: string;
    id?: string;
  };

  return data;
}

export async function refreshChatKitSession(params: { currentClientSecret: string }) {
  // First-pass implementation: create a new session.
  // Replace with the official refresh flow if you need token refresh semantics.
  return createChatKitSession({ userId: `refresh:${params.currentClientSecret.slice(0, 8)}` });
}
