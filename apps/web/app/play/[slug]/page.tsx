import { notFound } from "next/navigation";
import { PlayShell } from "@/components/play-shell";
import { getGame } from "@/lib/games";

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();
  return <PlayShell game={game} />;
}
