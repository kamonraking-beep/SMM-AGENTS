export async function createAssets(topic) {
    return {
        topic,
        featuredImagePrompt: `Professional editorial image for ${topic}`,
    };
}
