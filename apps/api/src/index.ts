import "dotenv/config";
const requiredEnvVars = [
  "OPENAI_API_KEY",
  "SMM_CHAT_DRAFT_URL",
  "SMM_JACAI_URL",
  "SMM_SAVE_CONTENT_DRAFT_URL",
  "SMM_GET_DRAFT_DETAILS_URL",
  "SMM_QUEUE_FOR_PUBLISH_URL",
  "SMM_PUBLISH_TO_STATIC_SITE_URL",
  "SMM_CRUD_URL",
  "SMM_SHAREPACKS_URL",
  "SMM_TAGX_RUN_URL",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

import { createServer } from "./server.js";

const port = Number(process.env.PORT) || 4000;
const host = "0.0.0.0";

const app = createServer();

app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});