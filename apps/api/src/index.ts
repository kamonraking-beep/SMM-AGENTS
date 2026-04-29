import "dotenv/config";
import { createServer } from "./server.js";

const port = Number(process.env.PORT) || 4000;
const host = "0.0.0.0";

const app = createServer();

app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});