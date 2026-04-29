import { z } from "zod";
export const workflowInputSchema = z.object({
    inputText: z.string().min(1),
});
