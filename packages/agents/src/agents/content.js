export async function writeDraft(topic) {
    return {
        title: `${topic} — starter draft`,
        content: `Draft body for ${topic}`,
    };
}
