import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.js";
import { draftsRouter } from "./routes/drafts.js";
import { publishRouter } from "./routes/publish.js";
import { chatkitRouter } from "./routes/chatkit.js";

export function createServer() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));

  app.use("/health", healthRouter);
  app.use("/drafts", draftsRouter);
  app.use("/publish", publishRouter);
  app.use("/chatkit", chatkitRouter);

  return app;
}
