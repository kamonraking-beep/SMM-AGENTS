import { Router } from "express";
import { createChatKitSession } from "../services/openai.js";

export const chatkitRouter: Router = Router();

chatkitRouter.post("/session", async (req, res) => {
  try {
    const result = await createChatKitSession({
      userId: req.body?.userId ?? "user_demo_123",
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to create ChatKit session",
    });
  }
});

chatkitRouter.post("/session/refresh", async (req, res) => {
  try {
    const result = await createChatKitSession({
      userId: req.body?.userId ?? "user_demo_123",
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to refresh ChatKit session",
    });
  }
});