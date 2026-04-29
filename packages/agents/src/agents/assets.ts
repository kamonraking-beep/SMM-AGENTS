export async function createAssets(topic: string) {
  return {
    topic,
    featuredImagePrompt: `Professional editorial image for ${topic}`,
  };
}
