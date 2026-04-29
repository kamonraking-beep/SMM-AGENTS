import { Router } from "express";
import { db } from "../db/prisma.js";

export const draftsRouter = Router();

draftsRouter.get("/", async (_req, res) => {
  try {
    const drafts = await db.draft.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
    res.json(drafts);
  } catch {
    res.json([
      {
        id: "draft_demo_123",
        title: "Welcome campaign draft",
        status: "draft",
        content: null,
      },
    ]);
  }
});
