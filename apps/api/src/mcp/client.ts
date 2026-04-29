export const mcpClient = {
  async queueForPublish(params: { draftId: string; requestedBy: string }) {
    // Replace this stub with a real MCP or HTTP call to your Jacai server.
    return {
      queued: true,
      draftId: params.draftId,
      requestedBy: params.requestedBy,
      provider: process.env.JACAI_MCP_SERVER_LABEL ?? "Jacai_MCP",
    };
  },
};
