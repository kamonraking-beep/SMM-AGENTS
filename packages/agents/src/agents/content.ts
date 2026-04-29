export async function writeDraft(topic: string) {
  return {
    title: `${topic} — starter draft`,
    content: `Draft body for ${topic}`,
  };
}
