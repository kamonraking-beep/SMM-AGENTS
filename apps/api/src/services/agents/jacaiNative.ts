function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export async function runJacai(message: string) {
  const response = await fetch(requiredEnv("SMM_JACAI_URL"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      ok: false,
      status: response.status,
      error: "Non-JSON response from JacAI",
      body: text,
    };
  }
}