export async function reviewDraft(content: string) {
  return {
    approved: content.length > 20,
    score: 86,
  };
}
