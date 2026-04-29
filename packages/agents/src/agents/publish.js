export async function publishDraft(draftId) {
    return {
        draftId,
        status: "queued",
    };
}
