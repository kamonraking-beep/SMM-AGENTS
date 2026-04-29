import { z } from "zod";
export declare const workflowDraftSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    status: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
