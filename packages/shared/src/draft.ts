import { z } from "zod";

export const draftSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["draft", "review", "approved", "queued", "published"]).or(z.string()),
  content: z.string().nullable().optional(),
});

export type Draft = z.infer<typeof draftSchema>;
