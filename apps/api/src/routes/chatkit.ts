import { Router } from "express";
import { z } from "zod";
import { createChatKitSession, refreshChatKitSession } from "../services/openai.js";

const sessionBodySchema = z.object({
  userId: z.string().min(1).optional(),
});

const refreshBodySchema = z.object({
  currentClientSecret: z.string().min(1),
});

export const chatkitRouter = Router();

chatkitRouter.post("/session", async (req, res) => {
  const parsed = sessionBodySchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  // Replace this with your authenticated user lookup.
  const userId = parsed.data.userId ?? "user_demo_123";

  try {
    const session = await createChatKitSession({ userId });
    return res.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create session";
    return res.status(500).json({ error: message });
  }
});

chatkitRouter.post("/session/refresh", async (req, res) => {
  const parsed = refreshBodySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const session = await refreshChatKitSession({
      currentClientSecret: parsed.data.currentClientSecret,
    });
    return res.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refresh session";
    return res.status(500).json({ error: message });
  }
});
