import { DraftList } from "@/components/drafts/DraftList";

export default function DraftsPage() {
  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Drafts</h1>
      <DraftList />
    </main>
  );
}
