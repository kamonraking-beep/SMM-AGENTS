import { Router } from "express";
import { z } from "zod";
import { runSmmWorkflow } from "@smm-ai/agents";

export const agentRouter: Router = Router();

const chatSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

agentRouter.post("/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: parsed.error.flatten(),
    });
  }

  try {
    const result = await runSmmWorkflow({
      message: parsed.data.message,
      history: parsed.data.history ?? [],
    });

    return res.json({
      ok: true,
      reply: result.reply,
      savedDraft: result.savedDraft ?? null,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown agent error",
    });
  }
});