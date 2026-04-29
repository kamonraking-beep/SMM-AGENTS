export async function reviewDraft(content) {
    return {
        approved: content.length > 20,
        score: 86,
    };
}
