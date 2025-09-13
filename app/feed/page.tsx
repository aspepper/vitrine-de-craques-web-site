import { FigmaScreen } from "@/components/FigmaScreen";
import screen from "@/docs/figma_pages/feeds.json";

export default function FeedPage() {
  return <FigmaScreen data={screen as any} />;
}
