import { runJacai } from "./jacaiNative.js";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import {
  smmGenerateSharepack,
  smmGetDraftDetails,
  smmNativeWorkflow,
  smmPublishToStaticSite,
  smmQueueForPublish,
  smmRunTagX,
} from "./smmNativeTools.js";


const getDraftTool = tool({
  name: "get_draft_details",
  description: "Get draft/article details by ID.",
  parameters: z.object({
    draftId: z.string(),
  }),
  async execute(input) {
    return smmGetDraftDetails(input.draftId);
  },
});

const nativePublishWorkflowTool = tool({
  name: "smm_native_publish_workflow",
  description:
    "Use the SMM app native workflow for combined tasks like image + TagX + sharepack + publish.",
  parameters: z.object({
    prompt: z.string(),
    toolKey: z.string(),
  }),
  async execute(input) {
    return smmNativeWorkflow(input.prompt, input.toolKey || "agent:publisher");
  },
});

const queuePublishTool = tool({
  name: "queue_for_publish",
  description: "Queue draft/article for publish.",
  parameters: z.object({
    draftId: z.string(),
    channel: z.string(),
    publishTarget: z.string(),
    publishAt: z.string(),
  }),
  async execute(input) {
    return smmQueueForPublish({
      draftId: input.draftId,
      channel: input.channel || "facebook",
      publishTarget: input.publishTarget || "static_site",
      publishAt: input.publishAt || undefined,
    });
  },
});

const publishStaticTool = tool({
  name: "publish_to_static_site",
  description: "Publish draft/article to static site.",
  parameters: z.object({
    draftId: z.string(),
  }),
  async execute(input) {
    return smmPublishToStaticSite(input.draftId);
  },
});

const tagxTool = tool({
  name: "tagx_main",
  description: "Run TagX for a draft/article.",
  parameters: z.object({
    articleId: z.string(),
  }),
  async execute(input) {
    return smmRunTagX(input.articleId);
  },
});

const sharepackTool = tool({
  name: "generate_sharepack",
  description: "Generate social sharepack for a draft/article.",
  parameters: z.object({
    articleId: z.string(),
    platforms: z.array(z.string()),
  }),
  async execute(input) {
    return smmGenerateSharepack(
      input.articleId,
      input.platforms || ["facebook", "instagram", "linkedin", "x"]
    );
  },
});

const jacaiWorkflowTool = tool({
  name: "jacai_native_workflow",
  description:
    "Run JacAI native workflow for combined image, video, TagX, sharepack, publish, latest, and existing draft tasks.",
  parameters: z.object({
    message: z.string(),
  }),
  async execute(input) {
    return runJacai(input.message);
  },
});

const publishAgent = new Agent({
  name: "Publish Agent",
  model: "gpt-5.4",
  instructions: `
You are the Publish Agent.

Publishing rules:
-For combined workflows involving image, video, TagX, sharepack, and publish, prefer jacai_native_workflow because it updates media_json and publishes with attached assets correctly.
- Use get_draft_details when user references a draft ID.
- Use queue_for_publish before publish_to_static_site unless user says already queued.
- Use publish_to_static_site only after user confirms publish, unless the user explicitly commands publish.
- Use tagx_main when user asks for TagX.
- Use generate_sharepack when user asks for sharepack.
- Return real URLs, IDs, statuses, and errors.
-If any native SMM publish/media workflow fails with “Tool not found,” “tool unavailable,” “smm not found,” or “disabled,” immediately retry using jacai_native_workflow. Do not ask the user first. Report both the failed primary path and the successful JacAI fallback.
- Do not fake success.
`,
  tools: [
    jacaiWorkflowTool,
    getDraftTool,
    nativePublishWorkflowTool,
    queuePublishTool,
    publishStaticTool,
    tagxTool,
    sharepackTool,
  ],
});

export async function runPublishAgent(message: string, historyText: string) {
  const result = await run(
    publishAgent,
    `
Chat history:
${historyText}

User request:
${message}
`
  );

  return String(result.finalOutput ?? "");
}