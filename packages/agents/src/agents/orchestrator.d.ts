export declare function orchestrate(input: string): Promise<{
    intent: "review" | "plan" | "create" | "assets" | "publish";
    response: string;
    draftId?: string | undefined;
}>;
