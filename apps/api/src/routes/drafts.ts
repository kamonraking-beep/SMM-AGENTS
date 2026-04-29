import { Router } from "express";

export const draftsRouter: Router = Router();

// GET drafts
draftsRouter.get("/", async (_req, res) => {
  try {
    const response = await fetch(process.env.SMM_GET_DRAFTS_URL!, {
      method: "GET",
    });

    const data = await response.json();

    return res.json({
      ok: true,
      drafts: data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to fetch drafts",
    });
  }
});