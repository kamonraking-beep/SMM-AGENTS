import { z } from "zod";

export const chatkitSessionSchema = z.object({
  client_secret: z.string(),
  id: z.string().optional(),
});

export type ChatkitSession = z.infer<typeof chatkitSessionSchema>;
