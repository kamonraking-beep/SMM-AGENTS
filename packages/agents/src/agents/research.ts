export function classifyIntent(input: string): "plan" | "create" | "review" | "assets" | "publish" {
  const text = input.toLowerCase();

  if (text.includes("publish")) return "publish";
  if (text.includes("review") || text.includes("qa")) return "review";
  if (text.includes("asset") || text.includes("image") || text.includes("visual")) return "assets";
  if (text.includes("plan") || text.includes("strategy")) return "plan";
  return "create";
}
