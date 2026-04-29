import express, { type Express } from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { draftsRouter } from "./routes/drafts.js";
import { publishRouter } from "./routes/publish.js";
import { chatkitRouter } from "./routes/chatkit.js";
import { agentRouter } from "./routes/agent.js";

export function createServer(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/drafts", draftsRouter);
  app.use("/publish", publishRouter);
  app.use("/chatkit", chatkitRouter);
  app.use("/agent", agentRouter);

  return app;
}