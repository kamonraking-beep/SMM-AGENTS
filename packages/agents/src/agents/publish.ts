export async function publishDraft(draftId: string) {
  return {
    draftId,
    status: "queued",
  };
}
