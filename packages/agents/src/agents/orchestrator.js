import { z } from "zod";
import { classifyIntent } from "./research.js";
const orchestrationResultSchema = z.object({
    intent: z.enum(["plan", "create", "review", "assets", "publish"]),
    draftId: z.string().optional(),
    response: z.string(),
});
export async function orchestrate(input) {
    const intent = classifyIntent(input);
    return orchestrationResultSchema.parse({
        intent,
        draftId: "draft_demo_123",
        response: `Workflow accepted input and routed it to: ${intent}`,
    });
}
