import { Router } from "express";
import { z } from "zod";

export const publishRouter: Router = Router();

const publishSchema = z.object({
  draftId: z.string().min(1),
  approvedBy: z.string().min(1),
});

publishRouter.post("/", async (req, res) => {
  const parsed = publishSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  return res.json({
    ok: true,
    queued: false,
    message: "Publish route is connected, but live publishing is not wired yet.",
    draftId: parsed.data.draftId,
  });
});