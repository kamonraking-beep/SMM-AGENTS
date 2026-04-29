export type ChatHistoryItem = {
    role: "user" | "assistant";
    content: string;
};
export type RunSmmWorkflowInput = {
    message: string;
    history?: ChatHistoryItem[];
};
export declare function runSmmWorkflow(input: RunSmmWorkflowInput): Promise<{
    reply: string;
    savedDraft: null;
}>;
