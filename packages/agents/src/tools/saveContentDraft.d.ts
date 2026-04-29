export type SaveContentDraftInput = {
    title: string;
    content: string;
    platform?: string;
};
export declare function saveContentDraft(input: SaveContentDraftInput): Promise<any>;
