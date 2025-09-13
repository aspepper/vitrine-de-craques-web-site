import { FigmaScreen } from "@/components/FigmaScreen";
import homeScreen from "@/docs/figma_pages/home.json";
import loggedScreen from "@/docs/figma_pages/home-logado.json";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const screen = session ? loggedScreen : homeScreen;
  return <FigmaScreen data={screen as any} />;
}
