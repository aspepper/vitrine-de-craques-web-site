import Link from "next/link";
import { Card, CardContent } from "./ui/card";

import { SafeImage } from "@/components/media/SafeMedia";

interface Video {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string;
}

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/player/${video.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="relative aspect-video">
            <SafeImage
              src={video.thumbnailUrl}
              alt={`Thumbnail para ${video.title}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="truncate">{video.title}</h3>
            <p className="text-sm text-muted-foreground">{video.author}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
