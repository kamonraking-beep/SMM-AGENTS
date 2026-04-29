export async function requirePublishApproval(params: { userId: string; draftId: string }) {
  if (!params.userId || !params.draftId) {
    throw new Error("Approval check failed");
  }

  // Replace with real org role / ownership / approval logic.
  return true;
}
