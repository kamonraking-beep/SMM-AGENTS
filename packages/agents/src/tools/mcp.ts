import { z } from "zod";

const configSchema = z.object({
  serverUrl: z.string().url(),
  serverLabel: z.string().min(1),
});

export function getMcpConfig() {
  return configSchema.parse({
    serverUrl: process.env.JACAI_MCP_SERVER_URL,
    serverLabel: process.env.JACAI_MCP_SERVER_LABEL,
  });
}
