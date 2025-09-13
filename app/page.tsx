import { FigmaScreen } from "@/components/FigmaScreen";
import screen from "@/docs/figma_pages/home.json";

export default function HomePage() {
  return <FigmaScreen data={screen as any} />;
}
