import { z } from "zod";

export const workflowDraftSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  content: z.string().optional(),
});
