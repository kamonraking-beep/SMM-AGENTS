import { Router } from "express";
import { z } from "zod";
import { requirePublishApproval } from "../services/approvals.js";
import { writeAuditLog } from "../services/audit.js";
import { mcpClient } from "../mcp/client.js";

const publishSchema = z.object({
  draftId: z.string().min(1),
  approvedBy: z.string().min(1),
});

export const publishRouter = Router();

publishRouter.post("/", async (req, res) => {
  const parsed = publishSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    await requirePublishApproval({
      userId: parsed.data.approvedBy,
      draftId: parsed.data.draftId,
    });

    await writeAuditLog({
      action: "publish.requested",
      actorId: parsed.data.approvedBy,
      resourceId: parsed.data.draftId,
    });

    const result = await mcpClient.queueForPublish({
      draftId: parsed.data.draftId,
      requestedBy: parsed.data.approvedBy,
    });

    return res.json({ ok: true, queued: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    return res.status(500).json({ error: message });
  }
});
