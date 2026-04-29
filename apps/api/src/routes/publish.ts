import { Router } from "express";
import { z } from "zod";

export const publishRouter: Router = Router();

const schema = z.object({
  draftId: z.string(),
});

publishRouter.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: parsed.error.flatten(),
    });
  }

  try {
    const response = await fetch(process.env.SMM_PUBLISH_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        draftId: parsed.data.draftId,
      }),
    });

    const data = await response.json();

    return res.json({
      ok: true,
      result: data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Publish failed",
    });
  }
});