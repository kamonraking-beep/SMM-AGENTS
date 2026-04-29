export async function writeAuditLog(event: {
  action: string;
  actorId: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}) {
  console.log("AUDIT_EVENT", JSON.stringify(event));
}
