import { Router } from "express";
import { z } from "zod";
import { saveContentDraft } from "../mcp/tools.js";

export const draftsRouter: Router = Router();

const saveDraftSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  platform: z.string().optional(),
});

draftsRouter.get("/", async (_req, res) => {
  res.json([]);
});

draftsRouter.post("/", async (req, res) => {
  const parsed = saveDraftSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const result = await saveContentDraft({
      title: parsed.data.title,
      content: parsed.data.content,
      platform: parsed.data.platform,
    });

    return res.json({
      ok: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});